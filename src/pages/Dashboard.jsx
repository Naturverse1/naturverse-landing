import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { BookOpen, Trophy, Star, Bell, Award, ShoppingBag, User } from 'lucide-react'
import StoryBuilder from '../components/StoryBuilder/StoryBuilder'
import Inventory from '../components/Marketplace/Inventory'
import WeatherWidget from '../components/Weather/WeatherWidget'
import GiftCodeRedemption from '../components/GiftCode/GiftCodeRedemption'
import Karaoke from '../components/KaraokeZone/Karaoke'
import Wardrobe from '../components/Navatar/Wardrobe'
import TutorBot from '../components/Naturversity/TutorBot'
import Companion from '../components/PetCompanions/Companion'
import RegionStorybook from '../components/Storybook/RegionStorybook'
import SelfieBooth from '../components/SelfieCam/SelfieBooth'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    completedModules: 0,
    totalModules: 12,
    stamps: 5,
    quizScore: 85
  })

  const recentActivities = [
    { id: 1, type: 'module', title: 'Ocean Adventures', time: '2 hours ago', icon: BookOpen },
    { id: 2, type: 'quiz', title: 'Forest Quiz', score: 90, time: '1 day ago', icon: Trophy },
    { id: 3, type: 'stamp', title: 'Explorer Badge', time: '2 days ago', icon: Award },
  ]

  const notifications = [
    { id: 1, title: 'New module unlocked!', message: 'Mountain Adventures is now available', time: '1 hour ago' },
    { id: 2, title: 'Quiz reminder', message: 'Complete the Ocean Quiz to earn your next stamp', time: '3 hours ago' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nature-green font-kid-friendly mb-2">
          Welcome back, {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Explorer'}! 🌟
        </h1>
        <p className="text-gray-600">Ready for your next adventure?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center bg-gradient-to-br from-green-400 to-green-600 text-white">
          <BookOpen className="mx-auto mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.completedModules}/{stats.totalModules}</div>
          <div className="text-sm">Modules Completed</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <Trophy className="mx-auto mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.quizScore}%</div>
          <div className="text-sm">Average Quiz Score</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-purple-400 to-purple-600 text-white">
          <Award className="mx-auto mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.stamps}</div>
          <div className="text-sm">Stamps Collected</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-orange-400 to-orange-600 text-white">
          <Star className="mx-auto mb-2" size={32} />
          <div className="text-2xl font-bold">🏆</div>
          <div className="text-sm">Nature Explorer</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Star className="mr-2" /> Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <activity.icon className="text-nature-green mr-3" size={24} />
                <div className="flex-1">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                  {activity.score && (
                    <div className="text-sm text-nature-green">Score: {activity.score}%</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2" /> Notifications
          </h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-nature-blue">
                <div className="font-medium text-gray-800">{notification.title}</div>
                <div className="text-sm text-gray-600 mb-1">{notification.message}</div>
                <div className="text-xs text-gray-500">{notification.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/learning" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <BookOpen className="h-8 w-8 text-nature-green mb-4" />
          <h3 className="text-lg font-semibold mb-2">Continue Learning</h3>
          <p className="text-gray-600">Explore new modules and quizzes</p>
        </Link>

        <Link to="/marketplace" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <ShoppingBag className="h-8 w-8 text-nature-green mb-4" />
          <h3 className="text-lg font-semibold mb-2">Marketplace</h3>
          <p className="text-gray-600">Buy items with $NATUR tokens</p>
        </Link>

        <Link to="/profile" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <User className="h-8 w-8 text-nature-green mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile</h3>
          <p className="text-gray-600">View your progress and stats</p>
        </Link>
      </div>

      {/* New Interactive Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <StoryBuilder />
          <RegionStorybook region="Enchanted Forest" />
          <GiftCodeRedemption />
          <Karaoke />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <Inventory />
          <TutorBot />
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Wardrobe />
        <Companion />
        <SelfieBooth />
      </div>
    </div>
  )
}

export default Dashboard