import { useState, useEffect } from "react";
import { getAllIngredients } from "../api/ingredient";
import IngredientCard from "../components/cards/IngredientCard";
import AddButton from "../components/buttons/addButton";
import IngredientForm from "../components/forms/ingredientForm";
import './ingredients.css';

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

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const handleIngredientCreated = (newIngredient) => {
    setIngredients((prev) => [...prev, newIngredient]);
    setShowCreateForm(false);
  };

  const handleFormCancel = () => {
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
          <AddButton 
            onClick={() => setShowCreateForm(true)}
            text="Add Ingredient"
          />
        </div>
      </div>

      {showCreateForm && (
        <IngredientForm
          onSubmit={handleIngredientCreated}
          onCancel={handleFormCancel}
        />
      )}

      <div className="ingredients-grid">
        {filteredAndSortedIngredients.map((ingredient) => (
          <IngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            onClick={() => {
              // Handle ingredient card click if needed
              console.log('Clicked ingredient:', ingredient);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Ingredients;