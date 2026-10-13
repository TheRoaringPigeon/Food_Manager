from utils.unit_conversion import to_grams
from utils.password_policy import validate_password_strength


class TestToGrams:
    def test_grams_unit(self):
        assert to_grams(100, "g") == 100.0

    def test_kilograms(self):
        assert to_grams(1, "kg") == 1000.0

    def test_cup(self):
        assert to_grams(1, "cup") == 236.588

    def test_tablespoon(self):
        assert to_grams(1, "tbsp") == 14.7868

    def test_teaspoon(self):
        assert to_grams(1, "tsp") == 4.92892

    def test_none_quantity_returns_none(self):
        assert to_grams(None, "cup") is None

    def test_none_unit_returns_none(self):
        assert to_grams(1.0, None) is None

    def test_unknown_unit_returns_none(self):
        assert to_grams(1.0, "clove") is None

    def test_case_insensitive_unit(self):
        assert to_grams(1, "CUP") == 236.588

    def test_whitespace_trimmed_unit(self):
        assert to_grams(1, " cup ") == 236.588

    def test_liter(self):
        assert to_grams(1, "liter") == 1000.0

    def test_pound(self):
        assert to_grams(1, "lb") == 453.592


class TestPasswordPolicy:
    def test_valid_password_passes(self):
        validate_password_strength("Valid@1234!")

    def test_too_short_raises(self):
        import pytest
        with pytest.raises(ValueError, match="at least 8 characters"):
            validate_password_strength("Ab1!")

    def test_missing_uppercase_raises(self):
        import pytest
        with pytest.raises(ValueError, match="uppercase"):
            validate_password_strength("nouppercase1!")

    def test_missing_digit_raises(self):
        import pytest
        with pytest.raises(ValueError, match="number"):
            validate_password_strength("NoDigits!")
