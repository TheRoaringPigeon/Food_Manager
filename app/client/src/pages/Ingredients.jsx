import { useState, useEffect } from "react";
import { getAllIngredients } from "../api/ingredient";
import IngredientCard from "../components/cards/IngredientCard";
import AddButton from "../components/buttons/addButton";
import IngredientForm from "../components/forms/addIngredientForm";
import UpdateIngredientForm from "../components/forms/updateIngredientForm";
import "./ingredients.css";
import { dummyIngredients } from "../constants/dummyIngredientData";
import ScrollBox from "../components/scrollBox/scrollBox";
import SearchBar from "../components/searchBars/searchBar";

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

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
        (filterCategory === "all" || ingredient.category === filterCategory) &&
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleIngredientUpdated = (updatedIngredient) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );
    setShowUpdateForm(false);
    setSelectedIngredient(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateFormCancel = () => {
    setShowCreateForm(false);
  };

  const handleUpdateFormCancel = () => {
    setShowUpdateForm(false);
    setSelectedIngredient(null);
  };

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient);
    setShowUpdateForm(true);
  };

  return (
    <div className="ingredients-container">
      <div className="ingredients-header">
        <h2>Ingredients ({filteredAndSortedIngredients.length})</h2>
        <div className="header-actions">
          <div className="controls">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search ingredients by name..."
            />
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
          onCancel={handleCreateFormCancel}
        />
      )}

      {showUpdateForm && selectedIngredient && (
        <UpdateIngredientForm
          ingredient={selectedIngredient}
          onSubmit={handleIngredientUpdated}
          onCancel={handleUpdateFormCancel}
        />
      )}

      <ScrollBox className="ingredients-grid-container">
        <div className="ingredients-grid">
          {filteredAndSortedIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onClick={() => handleIngredientClick(ingredient)}
            />
          ))}
        </div>
      </ScrollBox>
    </div>
  );
}

export default Ingredients;
