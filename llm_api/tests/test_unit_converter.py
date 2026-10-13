import pytest
from utils.unit_converter import estimate_grams, is_count_unit


class TestEstimateGrams:

    def test_cup_singular(self):
        assert estimate_grams(1, "cup") == pytest.approx(236.59)

    def test_cups_plural(self):
        assert estimate_grams(2, "cups") == pytest.approx(473.18)

    def test_tablespoon(self):
        assert estimate_grams(1, "tbsp") == pytest.approx(14.79)

    def test_tablespoons_plural(self):
        assert estimate_grams(3, "tablespoons") == pytest.approx(44.37)

    def test_teaspoon(self):
        assert estimate_grams(1, "tsp") == pytest.approx(4.93)

    def test_grams_passthrough(self):
        assert estimate_grams(100, "g") == 100.0

    def test_grams_word(self):
        assert estimate_grams(50, "grams") == 50.0

    def test_kg(self):
        assert estimate_grams(1, "kg") == 1000.0

    def test_oz(self):
        assert estimate_grams(2, "oz") == pytest.approx(56.699, abs=0.01)

    def test_lb(self):
        assert estimate_grams(1, "lb") == pytest.approx(453.592)

    def test_ml(self):
        assert estimate_grams(100, "ml") == 100.0

    def test_liter(self):
        assert estimate_grams(1, "liter") == 1000.0

    def test_pint(self):
        assert estimate_grams(1, "pint") == pytest.approx(473.18)

    def test_case_insensitive_cup(self):
        assert estimate_grams(1, "Cup") == pytest.approx(236.59)
        assert estimate_grams(1, "CUP") == pytest.approx(236.59)

    def test_none_quantity_returns_none(self):
        assert estimate_grams(None, "cup") is None

    def test_count_unit_without_grams_per_whole_returns_none(self):
        assert estimate_grams(1, "piece") is None
        assert estimate_grams(2, "slices") is None
        assert estimate_grams(1, "bar") is None

    def test_count_unit_with_grams_per_whole_unit(self):
        assert estimate_grams(2, "piece", grams_per_whole_unit=50.0) == 100.0
        assert estimate_grams(3, "slice", grams_per_whole_unit=30.0) == 90.0

    def test_unknown_unit_returns_none(self):
        assert estimate_grams(1, "unknown_unit") is None
        assert estimate_grams(1, "smidgen") is None

    def test_no_unit_no_grams_per_whole_treats_quantity_as_grams(self):
        assert estimate_grams(50, None) == 50
        assert estimate_grams(50, "") == 50

    def test_no_unit_with_grams_per_whole_multiplies(self):
        assert estimate_grams(3, None, grams_per_whole_unit=100.0) == 300.0

    # --- Regression tests for the milk calorie bug ---

    def test_two_cups_milk_grams(self):
        """2 cups of milk should convert to ~473g, the basis for ~288 kcal at 61 kcal/100g."""
        grams = estimate_grams(2, "cup")
        assert grams == pytest.approx(473.18)

    def test_two_cups_calorie_math_with_correct_density(self):
        """At whole milk density (61 kcal/100g), 2 cups = ~288 kcal, not ~2000."""
        grams = estimate_grams(2, "cup")
        calories = grams * 61.0 / 100.0
        assert 280 <= calories <= 300, f"Expected ~288 kcal, got {calories:.1f}"

    def test_two_cups_calorie_math_with_wrong_density_shows_bug(self):
        """With milk-powder density (496 kcal/100g), 2 cups would give ~2350 kcal — the original bug."""
        grams = estimate_grams(2, "cup")
        bad_calories = grams * 496.0 / 100.0
        assert bad_calories > 2000, "Confirms the bug: wrong kcal/100g produces absurd total"


class TestIsCountUnit:

    def test_piece_is_count(self):
        assert is_count_unit("piece") is True

    def test_bar_is_count(self):
        assert is_count_unit("bar") is True

    def test_cup_is_not_count(self):
        assert is_count_unit("cup") is False

    def test_grams_is_not_count(self):
        assert is_count_unit("g") is False

    def test_none_is_not_count(self):
        assert is_count_unit(None) is False

    def test_case_insensitive(self):
        assert is_count_unit("Piece") is True
        assert is_count_unit("SLICE") is True
