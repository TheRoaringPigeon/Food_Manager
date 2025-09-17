import { useState } from 'react'
import './App.css'
import Recipes from './pages/Recipes'
import Ingredients from './pages/Ingredients'
import TabButton from './components/buttons/tabButton'

function App() {
  const [activeTab, setActiveTab] = useState('recipes')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Manager</h1>
        <nav className="tab-nav">
          <TabButton 
            isActive={activeTab === 'recipes'}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </TabButton>
          <TabButton 
            isActive={activeTab === 'ingredients'}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </TabButton>
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