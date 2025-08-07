
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { BookOpen, Trophy, Star, Bell, Award } from 'lucide-react'

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
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What would you like to do today?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/learning" className="group">
            <div className="card bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 transition-all transform group-hover:scale-105">
              <BookOpen className="mx-auto mb-3 text-nature-green" size={48} />
              <h3 className="text-xl font-bold text-center text-gray-800">Start Learning</h3>
              <p className="text-center text-gray-600 mt-2">Explore new storybooks and videos</p>
            </div>
          </Link>
          
          <Link to="/quizzes" className="group">
            <div className="card bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-all transform group-hover:scale-105">
              <Trophy className="mx-auto mb-3 text-nature-blue" size={48} />
              <h3 className="text-xl font-bold text-center text-gray-800">Take a Quiz</h3>
              <p className="text-center text-gray-600 mt-2">Test your knowledge and earn stamps</p>
            </div>
          </Link>
          
          <Link to="/avatar" className="group">
            <div className="card bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 transition-all transform group-hover:scale-105">
              <Star className="mx-auto mb-3 text-nature-purple" size={48} />
              <h3 className="text-xl font-bold text-center text-gray-800">Customize Avatar</h3>
              <p className="text-center text-gray-600 mt-2">Create your unique nature explorer</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
