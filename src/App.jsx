import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TeacherDashboard from './pages/Teacher/Dashboard'
import StudentDashboard from './pages/Student/Dashboard'
import GameZone from './pages/GameZone/Index'
import BattleArena from './pages/Arena/BattleArena'
import { Elements } from '@stripe/react-stripe-js'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { stripePromise } from './utils/stripePromise'
import { loadGameState } from './utils/saveGame'
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
import MyInventory from './pages/MyInventory'
import AdminPanel from './pages/AdminPanel'
import Library from './routes/Library'
import Guardian from './routes/Guardian'
import Events from './routes/Events'
import VoiceQuest from './components/Voice/VoiceQuest'
import ThailandiaMap from './components/Map/ThailandiaMap'
import InventoryDrawer from './components/Inventory/InventoryDrawer'
import RegionStorybook from './components/Storybook/RegionStorybook'
import SelfieBooth from './components/SelfieCam/SelfieBooth'
import Trading from './pages/Trading.jsx';
import StoryMode from './components/StoryMode/StoryMode.jsx';

function AppContent() {
  const { user } = useAuth()

  useEffect(() => {
    if (user && !user.isGuest) {
      loadGameState(user.id).then((state) => {
        if (state) {
          console.log(`Welcome back to ${state.region || 'The Naturverse'}!`)

          // Store game state in sessionStorage for other components to access
          sessionStorage.setItem('gameState', JSON.stringify(state))

          // Dispatch custom event to notify components of loaded state
          window.dispatchEvent(new CustomEvent('gameStateLoaded', {
            detail: state
          }))
        } else {
          console.log('Starting fresh adventure in The Naturverse!')
        }
      }).catch((error) => {
        console.error('Failed to load game state:', error)
      })
    }
  }, [user])

  return (
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
            <Route path="/marketplace/admin" element={<MarketplaceAdmin />} />
            <Route path="/inventory" element={<MyInventory />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/marketplace-admin" element={<MarketplaceAdmin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin/analytics" element={<AdminPanel />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          <Route path="/arena" element={<BattleArena />} />
          <Route path="/games" element={<GameZone />} />
            <Route path="/library" element={<Library />} />
            <Route path="/guardian" element={<Guardian />} />
            <Route path="/events" element={<Events />} />
            <Route path="/voice" element={<VoiceQuest />} />
            <Route path="/map" element={<ThailandiaMap />} />
            <Route path="/storybook" element={<RegionStorybook />} />
            <Route path="/selfie" element={<SelfieBooth />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/storymode" element={<StoryMode />} />
          </Routes>

          {/* Global Inventory Drawer */}
          <InventoryDrawer />
        </main>
        <TurianAI />
      </div>
    </Router>
  )
}

function App() {
  return (
    <Elements stripe={stripePromise}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Elements>
  )
}

export default App