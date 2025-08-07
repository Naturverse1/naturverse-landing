import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Home, BookOpen, Trophy, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsOpen(false)
  }

  const navItems = user ? [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/learning', icon: BookOpen, label: 'Learning' },
    { to: '/quizzes', icon: Trophy, label: 'Quizzes' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/inventory', icon: User, label: 'My Inventory' },
  ] : []

  return (
    <nav className="bg-white shadow-lg border-b-4 border-nature-green">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="The Naturverse" className="h-10 w-10" />
            <span className="text-2xl font-bold text-nature-green font-kid-friendly">
              The Naturverse™
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-1 text-gray-700 hover:text-nature-green transition-colors"
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/avatar"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🧙‍♂️ Avatar
            </Link>
            <Link
              to="/voice"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🎤 Voice Quest
            </Link>
            <Link
              to="/map"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🗺️ Map
            </Link>
            <Link to="/games" className="text-gray-600 hover:text-nature-green transition-colors">
              🎮 Games
            </Link>
            <Link to="/arena" className="text-gray-600 hover:text-nature-green transition-colors">
              ⚔️ Battle Arena
            </Link>
            <Link to="/marketplace" className="nav-link">
              🛒 Marketplace
            </Link>
            <Link to="/trading" className="nav-link">
              🔄 Trading
            </Link>
            <Link to="/storymode" className="nav-link">
              📚 Story Mode
            </Link>
            <Link to="/talk" className="nav-link">
              🎤 Talk to Turian
            </Link>
            <Link to="/parents" className="nav-link">
              🛡️ Parent Dashboard
            </Link>
            <Link to="/naturefit" className="nav-link">
              🌿 NatureFit™
            </Link>
            <Link to="/musiczone" className="nav-link">
              🎤 MusicZone™
            </Link>
            <Link to="/storyforge" className="nav-link">
              📖 Story Forge™
            </Link>
            <Link to="/ar-cam" className="nav-link">
              🎭 AR Camera™
            </Link>
            <Link to="/island-builder" className="nav-link">
              🏝️ Island Builder™
            </Link>
            <Link to="/codex" className="nav-link">
              📚 Turian's Codex™
            </Link>
            <Link to="/story" className="nav-link">
              🛸 Story Portal™
            </Link>
            <Link to="/hub" className="nav-link">
              🧑‍🤝‍🧑 Player Hub™
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            )}
            {/* Add Admin Panel link for admins */}
            {user && (
              <Link to="/admin-panel" className="flex items-center space-x-1 text-gray-700 hover:text-nature-green transition-colors">
                <Settings size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-nature-green"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
              <Link
                to="/avatar"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Avatar</span>
              </Link>
              <Link
                to="/voice"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Voice Quest</span>
              </Link>
              <Link
                to="/map"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Map</span>
              </Link>
              <Link
                to="/games"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <Trophy size={20} />
                <span>Games</span>
              </Link>
              <Link
                to="/arena"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <Trophy size={20} />
                <span>Battle Arena</span>
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Marketplace</span>
              </Link>
              <Link
                to="/trading"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Trading</span>
              </Link>
              <Link
                to="/storymode"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Story Mode</span>
              </Link>
              <Link
                to="/talk"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Talk to Turian</span>
              </Link>
              <Link
                to="/parents"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Parent Dashboard</span>
              </Link>
              <Link
                to="/naturefit"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>NatureFit™</span>
              </Link>
              <Link
                to="/musiczone"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>MusicZone™</span>
              </Link>
              <Link
                to="/storyforge"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Story Forge™</span>
              </Link>
              <Link
                to="/ar-cam"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>AR Camera™</span>
              </Link>
              <Link
                to="/island-builder"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Island Builder™</span>
              </Link>
              <Link
                to="/codex"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Turian's Codex™</span>
              </Link>
              <Link
                to="/story"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Story Portal™</span>
              </Link>
              <Link
                to="/hub"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors"
              >
                <User size={20} />
                <span>Player Hub™</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
              {/* Add Admin Panel link for admins in mobile */}
              <Link to="/admin-panel" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 text-gray-700 hover:text-nature-green transition-colors">
                <Settings size={20} />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar