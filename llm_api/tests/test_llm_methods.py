"""
Unit tests for OllamaLLM helper methods introduced/modified as part of the
voice-log calorie sanity-check fix.  The Ollama HTTP client (self.chat) is
mocked so no running Ollama instance is required.
"""
import pytest
from unittest.mock import AsyncMock

from integrations.llm import OllamaLLM


@pytest.fixture
def llm():
    instance = OllamaLLM.__new__(OllamaLLM)
    instance.model = "test-model"
    instance.host = "http://localhost:11434"
    instance.api_url = "http://localhost:11434/api"
    instance.client = None   # not used; we mock self.chat
    return instance


def _chat_response(content: str):
    return {"message": {"content": content}}


# ---------------------------------------------------------------------------
# sanity_check_calories
# ---------------------------------------------------------------------------

class TestSanityCheckCalories:

    async def test_ok_response_returns_none(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("ok"))
        result = await llm.sanity_check_calories("milk", 2, "cup", 290.0)
        assert result is None

    async def test_ok_with_trailing_whitespace_returns_none(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("ok "))
        result = await llm.sanity_check_calories("milk", 2, "cup", 290.0)
        assert result is None

    async def test_ok_case_insensitive(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("OK"))
        result = await llm.sanity_check_calories("milk", 2, "cup", 290.0)
        assert result is None

    async def test_corrected_value_returned(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("290"))
        result = await llm.sanity_check_calories("milk", 2, "cup", 2350.0)
        assert result == 290.0

    async def test_corrected_value_with_surrounding_text(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("The correct value is 290 kcal."))
        result = await llm.sanity_check_calories("milk", 2, "cup", 2350.0)
        assert result == 290.0

    async def test_thinking_block_stripped_then_ok(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("<think>reasoning here</think>ok"))
        result = await llm.sanity_check_calories("milk", 2, "cup", 290.0)
        assert result is None

    async def test_thinking_block_stripped_then_number(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("<think>it should be 290</think>290"))
        result = await llm.sanity_check_calories("milk", 2, "cup", 2350.0)
        assert result == 290.0

    async def test_nonsense_response_returns_none(self, llm):
        """If the model returns gibberish, don't break — treat as pass."""
        llm.chat = AsyncMock(return_value=_chat_response("I'm unable to determine this."))
        result = await llm.sanity_check_calories("milk", 2, "cup", 290.0)
        assert result is None

    async def test_none_unit_handled(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("ok"))
        result = await llm.sanity_check_calories("banana", 1, None, 105.0)
        assert result is None

    async def test_none_quantity_handled(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("ok"))
        result = await llm.sanity_check_calories("banana", None, None, 105.0)
        assert result is None


# ---------------------------------------------------------------------------
# estimate_calories_direct
# ---------------------------------------------------------------------------

class TestEstimateCaloriesDirect:

    async def test_plain_integer_returned(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("290"))
        result = await llm.estimate_calories_direct("milk", 2, "cup")
        assert result == 290.0

    async def test_decimal_value_returned(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("288.6"))
        result = await llm.estimate_calories_direct("milk", 2, "cup")
        assert result == pytest.approx(288.6)

    async def test_thinking_block_stripped(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("<think>2 cups = 480ml</think>290"))
        result = await llm.estimate_calories_direct("milk", 2, "cup")
        assert result == 290.0

    async def test_number_embedded_in_text_extracted(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("Approximately 290 kcal"))
        result = await llm.estimate_calories_direct("milk", 2, "cup")
        assert result == 290.0

    async def test_no_number_returns_none(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("I cannot estimate this."))
        result = await llm.estimate_calories_direct("milk", 2, "cup")
        assert result is None

    async def test_none_unit_in_prompt(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("105"))
        result = await llm.estimate_calories_direct("banana", 1, None)
        assert result == 105.0


# ---------------------------------------------------------------------------
# pick_usda_match
# ---------------------------------------------------------------------------

class TestPickUsdaMatch:

    async def test_valid_index_returned(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response('{"index": 1, "confidence": "high"}'))
        candidates = [
            {"description": "Milk, whole, dry", "dataType": "SR Legacy"},
            {"description": "Milk, whole, 3.25% milkfat", "dataType": "SR Legacy"},
        ]
        result = await llm.pick_usda_match("milk", candidates)
        assert result == 1

    async def test_null_index_returns_none(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response('{"index": null, "confidence": "none"}'))
        candidates = [{"description": "Cream, heavy whipping", "dataType": "SR Legacy"}]
        result = await llm.pick_usda_match("milk", candidates)
        assert result is None

    async def test_zero_index_valid(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response('{"index": 0, "confidence": "high"}'))
        candidates = [{"description": "Milk, whole, 3.25% milkfat", "dataType": "Foundation"}]
        result = await llm.pick_usda_match("milk", candidates)
        assert result == 0

    async def test_malformed_json_falls_back_to_zero(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("I choose index 0"))
        candidates = [{"description": "Milk, whole", "dataType": "SR Legacy"}]
        result = await llm.pick_usda_match("milk", candidates)
        assert result == 0


# ---------------------------------------------------------------------------
# match_ingredient
# ---------------------------------------------------------------------------

class TestMatchIngredient:

    async def test_exact_match_returned(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("whole milk"))
        result = await llm.match_ingredient("milk", ["whole milk", "condensed milk", "skim milk"])
        assert result == "whole milk"

    async def test_none_response_returns_none(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("none"))
        result = await llm.match_ingredient("milk", ["condensed milk", "milk powder"])
        assert result is None

    async def test_empty_candidate_list_returns_none(self, llm):
        result = await llm.match_ingredient("milk", [])
        assert result is None

    async def test_case_insensitive_matching(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("Whole Milk"))
        result = await llm.match_ingredient("milk", ["whole milk"])
        assert result == "whole milk"

    async def test_thinking_block_stripped(self, llm):
        llm.chat = AsyncMock(return_value=_chat_response("<think>looking...</think>whole milk"))
        result = await llm.match_ingredient("milk", ["whole milk", "condensed milk"])
        assert result == "whole milk"
