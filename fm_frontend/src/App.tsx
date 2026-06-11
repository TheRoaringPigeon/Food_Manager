import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme, type ThemeId, THEMES } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import IngredientsPage from './pages/IngredientsPage'
import RecipesPage from './pages/RecipesPage'
import RecommendationsPage from './pages/RecommendationsPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

function ThemeSync() {
  const { user } = useAuth()
  const { setTheme } = useTheme()

  useEffect(() => {
    const id = user?.theme as ThemeId | undefined
    if (id && THEMES.some(t => t.id === id)) {
      setTheme(id)
    } else if (!user) {
      setTheme('indigo')
    }
  }, [user?.theme, !!user])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeSync />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/ingredients" replace />} />
                <Route path="ingredients" element={<IngredientsPage />} />
                <Route path="recipes" element={<RecipesPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<Layout />}>
                <Route index element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
