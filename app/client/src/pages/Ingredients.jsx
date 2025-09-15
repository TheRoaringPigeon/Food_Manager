import { useState, useEffect } from "react";
import {
  getAllIngredients,
  createIngredient,
  searchIngredients,
} from "../api/ingredient";
import "../components/ingredients.css";

// Dummy data for ingredients
const dummyIngredients = [
  {
    id: 1,
    name: "Chicken Breast",
    category: "Protein",
    quantity: 2,
    unit: "lbs",
    expiryDate: "2024-09-15",
    location: "Refrigerator",
  },
  {
    id: 2,
    name: "Broccoli",
    category: "Vegetable",
    quantity: 1,
    unit: "head",
    expiryDate: "2024-09-12",
    location: "Refrigerator",
  },
  {
    id: 3,
    name: "Spaghetti",
    category: "Grain",
    quantity: 500,
    unit: "g",
    expiryDate: "2025-03-20",
    location: "Pantry",
  },
  {
    id: 4,
    name: "Parmesan Cheese",
    category: "Dairy",
    quantity: 200,
    unit: "g",
    expiryDate: "2024-10-01",
    location: "Refrigerator",
  },
  {
    id: 5,
    name: "Olive Oil",
    category: "Oil",
    quantity: 1,
    unit: "bottle",
    expiryDate: "2025-06-15",
    location: "Pantry",
  },
  {
    id: 6,
    name: "Eggs",
    category: "Protein",
    quantity: 12,
    unit: "count",
    expiryDate: "2024-09-18",
    location: "Refrigerator",
  },
];

// Predefined options for dropdowns
const CATEGORIES = [
  "Protein",
  "Vegetable",
  "Grain",
  "Dairy",
  "Oil",
  "Spice",
  "Condiment",
  "Fruit",
  "Other",
];
const UNITS = [
  "g",
  "kg",
  "lbs",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "count",
  "bottle",
  "can",
  "head",
  "bunch",
  "piece",
];
const LOCATIONS = [
  "Refrigerator",
  "Freezer",
  "Pantry",
  "Spice Rack",
  "Counter",
];

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nameValid, setNameValid] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    location: "",
  });

  const fetchAllIngredients = async () => {
    try {
      const response = await getAllIngredients();
      setIngredients(response.results.ingredients);
    } catch (err) {
      console.error("Failed to fetch ingredients: ", err);
      setIngredients(dummyIngredients);
    }
  };

  useEffect(() => {
    fetchAllIngredients();
  }, []);

  const categories = [
    "all",
    ...new Set(ingredients.map((ing) => ing.category)),
  ];

  const filteredAndSortedIngredients = ingredients
    .filter(
      (ingredient) =>
        filterCategory === "all" || ingredient.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "expiry")
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateName = async () => {
    if (!newIngredient.name.trim()) {
      setNameValid(false);
      return;
    }
    try {
      const response = await searchIngredients(newIngredient.name);
      if (response.success) {
        let originalName = true;
        response.results.forEach((ingredient) => {
          if (newIngredient.name === ingredient.name) {
            setNewIngredient({
              ...newIngredient,
              name: `${ingredient.name} is already used.`,
            });
            originalName = false;
          }
        });
        setNameValid(originalName);
      }
    } catch (error) {
      console.error(error);
      setNewIngredient({ ...newIngredient, name: "Error Checking name in DB" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!nameValid) {
      alert(
        "The name desired was already taken. PLease either enter a new name or update the existing Ingredient."
      );
      return;
    }

    try {
      const response = await createIngredient(newIngredient);

      setIngredients((prev) => [
        ...prev,
        { ...newIngredient, id: response.results.id },
      ]);

      // Reset form and close
      setNewIngredient({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        expiryDate: "",
        location: "",
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create ingredient: ", err);
      alert("Failed to create ingredient. Please try again.");
    }
  };

  const handleCancel = () => {
    setNewIngredient({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      expiryDate: "",
      location: "",
    });
    setShowCreateForm(false);
  };

  return (
    <div className="ingredients-container">
      <div className="ingredients-header">
        <h2>Ingredients ({ingredients.length})</h2>
        <div className="header-actions">
          <div className="controls">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="expiry">Sort by Expiry</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="add-ingredient-btn"
          >
            + Add Ingredient
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-form-overlay">
          <div className="create-form-container">
            <h3>Add New Ingredient</h3>
            <form onSubmit={handleSubmit} className="create-ingredient-form">
              <div className="form-row">
                <div className="form-group">
                  <label
                    htmlFor="name"
                    className={
                      nameValid ? "nameLabel-normal" : "nameLabel-error"
                    }
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newIngredient.name}
                    onChange={handleInputChange}
                    onBlur={validateName}
                    placeholder="e.g., Chicken Breast"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={newIngredient.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newIngredient.quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="any"
                    placeholder="e.g., 2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unit *</label>
                  <select
                    id="unit"
                    name="unit"
                    value={newIngredient.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select unit</option>
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={newIngredient.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <select
                    id="location"
                    name="location"
                    value={newIngredient.location}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ingredients-grid">
        {filteredAndSortedIngredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className={`ingredient-card ${
              isExpiringSoon(ingredient.expiryDate) ? "expiring-soon" : ""
            }`}
          >
            <div className="ingredient-header">
              <h3>{ingredient.name}</h3>
              <span className="category-badge">{ingredient.category}</span>
            </div>
            <div className="ingredient-details">
              <div className="quantity">
                <strong>
                  {ingredient.quantity} {ingredient.unit}
                </strong>
              </div>
              <div className="location">📍 {ingredient.location}</div>
              <div
                className={`expiry ${
                  isExpiringSoon(ingredient.expiryDate) ? "warning" : ""
                }`}
              >
                📅 Expires:{" "}
                {new Date(ingredient.expiryDate).toLocaleDateString()}
                {isExpiringSoon(ingredient.expiryDate) && (
                  <span className="warning-text"> ⚠️ Expiring Soon!</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Ingredients;
