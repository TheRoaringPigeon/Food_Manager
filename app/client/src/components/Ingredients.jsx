import { useState } from 'react'

// Dummy data for ingredients
const dummyIngredients = [
  {
    id: 1,
    name: "Chicken Breast",
    category: "Protein",
    quantity: 2,
    unit: "lbs",
    expiryDate: "2024-09-15",
    location: "Refrigerator"
  },
  {
    id: 2,
    name: "Broccoli",
    category: "Vegetable",
    quantity: 1,
    unit: "head",
    expiryDate: "2024-09-12",
    location: "Refrigerator"
  },
  {
    id: 3,
    name: "Spaghetti",
    category: "Grain",
    quantity: 500,
    unit: "g",
    expiryDate: "2025-03-20",
    location: "Pantry"
  },
  {
    id: 4,
    name: "Parmesan Cheese",
    category: "Dairy",
    quantity: 200,
    unit: "g",
    expiryDate: "2024-10-01",
    location: "Refrigerator"
  },
  {
    id: 5,
    name: "Olive Oil",
    category: "Oil",
    quantity: 1,
    unit: "bottle",
    expiryDate: "2025-06-15",
    location: "Pantry"
  },
  {
    id: 6,
    name: "Eggs",
    category: "Protein",
    quantity: 12,
    unit: "count",
    expiryDate: "2024-09-18",
    location: "Refrigerator"
  }
]

function Ingredients() {
  const [ingredients] = useState(dummyIngredients)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const categories = ['all', ...new Set(ingredients.map(ing => ing.category))]

  const filteredAndSortedIngredients = ingredients
    .filter(ingredient => filterCategory === 'all' || ingredient.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  const isExpiringSoon = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  return (
    <div className="ingredients-container">
      <div className="ingredients-header">
        <h2>Ingredients ({ingredients.length})</h2>
        <div className="controls">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
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
      </div>

      <div className="ingredients-grid">
        {filteredAndSortedIngredients.map(ingredient => (
          <div 
            key={ingredient.id} 
            className={`ingredient-card ${isExpiringSoon(ingredient.expiryDate) ? 'expiring-soon' : ''}`}
          >
            <div className="ingredient-header">
              <h3>{ingredient.name}</h3>
              <span className="category-badge">{ingredient.category}</span>
            </div>
            <div className="ingredient-details">
              <div className="quantity">
                <strong>{ingredient.quantity} {ingredient.unit}</strong>
              </div>
              <div className="location">📍 {ingredient.location}</div>
              <div className={`expiry ${isExpiringSoon(ingredient.expiryDate) ? 'warning' : ''}`}>
                📅 Expires: {new Date(ingredient.expiryDate).toLocaleDateString()}
                {isExpiringSoon(ingredient.expiryDate) && (
                  <span className="warning-text"> ⚠️ Expiring Soon!</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Ingredients