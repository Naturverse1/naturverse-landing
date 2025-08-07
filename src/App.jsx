
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import TurianAI from './components/TurianAI'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Learning from './pages/Learning'
import Quizzes from './pages/Quizzes'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import AvatarCreator from './pages/AvatarCreator'
import Marketplace from './pages/Marketplace'
import MarketplaceAdmin from './pages/MarketplaceAdmin'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/avatar" element={<AvatarCreator />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/marketplace" element={<MarketplaceAdmin />} />
            </Routes>
          </main>
          <TurianAI />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
