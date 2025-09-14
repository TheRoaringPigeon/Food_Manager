import { useState } from 'react'
import './App.css'
import Recipes from './pages/Recipes'
import Ingredients from './pages/Ingredients'

function App() {
  const [activeTab, setActiveTab] = useState('recipes')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Manager</h1>
        <nav className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
          <button 
            className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
        </nav>
      </header>
      <main className="main-content">
        {activeTab === 'recipes' && <Recipes />}
        {activeTab === 'ingredients' && <Ingredients />}
      </main>
    </div>
  )
}

export default App