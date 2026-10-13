"""
Unit and regression tests for VoiceLogService._resolve_calories.

All external I/O (LLM, FM API, USDA HTTP, Redis) is mocked so these run
without any running services.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from services.voice_log_service import VoiceLogService


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_llm():
    llm = AsyncMock()
    llm.parse_voice_transcript = AsyncMock(return_value=[])
    llm.match_ingredient = AsyncMock(return_value=None)
    llm.pick_usda_match = AsyncMock(return_value=None)
    llm.sanity_check_calories = AsyncMock(return_value=None)   # None = "ok, passes"
    llm.estimate_calories_direct = AsyncMock(return_value=None)
    llm.estimate_portion_grams = AsyncMock(return_value=None)
    return llm


@pytest.fixture
def mock_fm():
    fm = AsyncMock()
    fm.search_ingredients = AsyncMock(return_value=[])
    return fm


@pytest.fixture
def service(mock_llm, mock_fm):
    svc = VoiceLogService(fm_client=mock_fm, llm=mock_llm)
    svc._redis = AsyncMock()
    return svc


def _usda_response(foods: list):
    """Build a mock httpx context-manager that returns the given USDA food list."""
    mock_http = AsyncMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"foods": foods}
    mock_http.get = AsyncMock(return_value=mock_resp)

    mock_ctx = MagicMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_http)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)
    return mock_ctx


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

MILK_INGREDIENT = {
    "id": 1,
    "name": "milk",
    "calories_per_100g": 61.0,
    "grams_per_whole_unit": None,
}

MILK_POWDER_INGREDIENT = {
    "id": 2,
    "name": "milk",
    "calories_per_100g": 496.0,   # dry whole milk powder — the wrong value from the bug
    "grams_per_whole_unit": None,
}

USDA_MILK_WHOLE = {
    "fdcId": "111",
    "description": "Milk, whole, 3.25% milkfat, with added vitamin D",
    "dataType": "SR Legacy",
    "foodNutrients": [{"nutrientId": 1008, "value": 61.0}],
}

USDA_MILK_DRY = {
    "fdcId": "222",
    "description": "Milk, whole, dry",
    "dataType": "SR Legacy",
    "foodNutrients": [{"nutrientId": 1008, "value": 496.0}],
}


# ---------------------------------------------------------------------------
# Pass 1 — Local DB path
# ---------------------------------------------------------------------------

class TestLocalDbPath:

    async def test_correct_data_returns_expected_calories(self, service, mock_llm, mock_fm):
        """2 cups of milk with correct calorie data → ~288 kcal."""
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.sanity_check_calories.return_value = None  # passes

        result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        # 2 cups = 473.18 g; 473.18 * 61 / 100 = 288.6 kcal
        assert result["calories"] == pytest.approx(288.6, abs=1.0)
        assert result["source"] == "local"

    async def test_sanity_check_called_with_computed_value(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.sanity_check_calories.return_value = None

        await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        mock_llm.sanity_check_calories.assert_called_once()
        _, _, _, raw_cal = mock_llm.sanity_check_calories.call_args.args
        assert raw_cal == pytest.approx(288.6, abs=1.0)

    async def test_no_calorie_data_on_ingredient_skips_to_next_pass(self, service, mock_llm, mock_fm):
        no_cal = {**MILK_INGREDIENT, "calories_per_100g": None}
        mock_fm.search_ingredients.return_value = [no_cal]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient", return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        # Should reach LLM direct fallback
        assert result["source"] == "llm"

    async def test_no_local_match_proceeds_to_usda(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = None  # no match
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient", return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        # Falls through local → USDA (empty) → LLM direct
        assert result["source"] == "llm"


# ---------------------------------------------------------------------------
# Pass 1 — count unit fallback to estimate_portion_grams
# ---------------------------------------------------------------------------

class TestCountUnitPortionEstimate:

    async def test_piece_unit_calls_estimate_portion_grams(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = [
            {"id": 3, "name": "granola bar", "calories_per_100g": 450.0, "grams_per_whole_unit": None}
        ]
        mock_llm.match_ingredient.return_value = "granola bar"
        mock_llm.estimate_portion_grams.return_value = 40.0  # 1 bar ≈ 40 g
        mock_llm.sanity_check_calories.return_value = None

        result = await service._resolve_calories({"name": "granola bar", "quantity": 1, "unit": "bar"})

        mock_llm.estimate_portion_grams.assert_called_once_with("granola bar", 1, "bar")
        # 40 g * 450 / 100 = 180 kcal
        assert result["calories"] == pytest.approx(180.0)
        assert result["source"] == "local"

    async def test_grams_per_whole_unit_used_over_llm_estimate(self, service, mock_llm, mock_fm):
        """If the ingredient record has grams_per_whole_unit, use it directly."""
        mock_fm.search_ingredients.return_value = [
            {"id": 4, "name": "egg", "calories_per_100g": 143.0, "grams_per_whole_unit": 50.0}
        ]
        mock_llm.match_ingredient.return_value = "egg"
        mock_llm.sanity_check_calories.return_value = None

        result = await service._resolve_calories({"name": "egg", "quantity": 2, "unit": "egg"})

        mock_llm.estimate_portion_grams.assert_not_called()
        # 2 * 50 g * 143 / 100 = 143 kcal
        assert result["calories"] == pytest.approx(143.0)


# ---------------------------------------------------------------------------
# Pass 2 — USDA path
# ---------------------------------------------------------------------------

class TestUsdaPath:

    async def test_usda_match_returns_expected_calories(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = []
        mock_llm.pick_usda_match.return_value = 0
        mock_llm.sanity_check_calories.return_value = None

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([USDA_MILK_WHOLE])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == pytest.approx(288.6, abs=1.0)
        assert result["source"] == "usda"

    async def test_usda_null_index_falls_through_to_llm_direct(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = []
        mock_llm.pick_usda_match.return_value = None
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([USDA_MILK_DRY])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["source"] == "llm"
        assert result["calories"] == 290.0

    async def test_usda_sanity_check_fires_on_wrong_match(self, service, mock_llm, mock_fm):
        """If USDA returns a dry/condensed entry with high kcal/100g, sanity check corrects it."""
        mock_fm.search_ingredients.return_value = []
        mock_llm.pick_usda_match.return_value = 0        # picks milk powder
        mock_llm.sanity_check_calories.return_value = 290.0  # LLM corrects

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([USDA_MILK_DRY])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == 290.0
        assert result["source"] == "usda"
        # Confirm sanity check received the wrong raw value (>2000 kcal)
        raw_cal = mock_llm.sanity_check_calories.call_args.args[3]
        assert raw_cal > 2000

    async def test_empty_usda_results_falls_through(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = []
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["source"] == "llm"


# ---------------------------------------------------------------------------
# Pass 3 — LLM direct fallback
# ---------------------------------------------------------------------------

class TestLlmDirectFallback:

    async def test_used_when_no_local_or_usda_match(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = []
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == 290.0
        assert result["source"] == "llm"
        mock_llm.estimate_calories_direct.assert_called_once_with("milk", 2, "cup")

    async def test_all_passes_fail_leaves_calories_none(self, service, mock_llm, mock_fm):
        mock_fm.search_ingredients.return_value = []
        mock_llm.estimate_calories_direct.return_value = None

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "mystery food", "quantity": 1, "unit": "cup"})

        assert result["calories"] is None
        assert result["source"] == "unknown"


# ---------------------------------------------------------------------------
# Sanity check wiring
# ---------------------------------------------------------------------------

class TestSanityCheckWiring:

    async def test_sanity_check_ok_uses_raw_calories(self, service, mock_llm, mock_fm):
        """When sanity_check returns None (ok), raw computed value is used unchanged."""
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.sanity_check_calories.return_value = None  # ok

        result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == pytest.approx(288.6, abs=1.0)

    async def test_sanity_check_correction_replaces_raw(self, service, mock_llm, mock_fm):
        """When sanity_check returns a number, it replaces the raw (wrong) value."""
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.sanity_check_calories.return_value = 999.0  # arbitrary correction

        result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == 999.0


# ---------------------------------------------------------------------------
# Regression: the original milk bug
# ---------------------------------------------------------------------------

class TestMilkCalorieBugRegression:

    async def test_milk_with_milk_powder_calorie_data_is_corrected(self, service, mock_llm, mock_fm):
        """
        Regression test for the original bug:
        'I had 2 cups of milk' returned ~2350 kcal because the local ingredient
        had milk powder calories_per_100g (496) instead of whole milk (61).
        The sanity check must correct this.
        """
        mock_fm.search_ingredients.return_value = [MILK_POWDER_INGREDIENT]
        mock_llm.match_ingredient.return_value = "milk"
        mock_llm.sanity_check_calories.return_value = 290.0  # corrects the 2350 kcal

        result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] == 290.0, (
            "Sanity check should have corrected the ~2350 kcal from milk powder data to ~290"
        )
        # Verify the raw wrong value was passed to sanity_check
        mock_llm.sanity_check_calories.assert_called_once()
        raw_cal = mock_llm.sanity_check_calories.call_args.args[3]
        assert raw_cal > 2000, f"Expected raw calories > 2000 (milk powder), got {raw_cal}"

    async def test_milk_with_no_local_match_uses_llm_direct(self, service, mock_llm, mock_fm):
        """
        Regression: when the stricter match_ingredient prompt rejects all local candidates,
        the LLM direct fallback must provide a value instead of leaving calories empty.
        """
        mock_fm.search_ingredients.return_value = [MILK_INGREDIENT]
        mock_llm.match_ingredient.return_value = None  # stricter prompt rejects match
        mock_llm.estimate_calories_direct.return_value = 290.0

        with patch("services.voice_log_service.httpx.AsyncClient",
                   return_value=_usda_response([])):
            result = await service._resolve_calories({"name": "milk", "quantity": 2, "unit": "cup"})

        assert result["calories"] is not None, "Calories should not be empty when LLM direct fallback is available"
        assert result["calories"] == 290.0
        assert result["source"] == "llm"

    async def test_empty_name_always_returns_none(self, service):
        result = await service._resolve_calories({"name": "", "quantity": 2, "unit": "cup"})
        assert result["calories"] is None
