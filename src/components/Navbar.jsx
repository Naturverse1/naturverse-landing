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