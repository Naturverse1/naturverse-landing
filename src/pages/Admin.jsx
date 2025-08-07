import React, { useState } from 'react'
import { Users, BookOpen, MessageSquare, Bell, BarChart3, Settings } from 'lucide-react'
import QuestionBroadcaster from '../components/Admin/QuestionBroadcaster';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'modules', name: 'Modules', icon: BookOpen },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalModules: 48,
    completedQuizzes: 3420,
    feedbackMessages: 156,
    totalStamps: 8960
  }

  const recentUsers = [
    { id: 1, name: 'Alex Explorer', email: 'alex@example.com', joined: '2 hours ago', level: 3 },
    { id: 2, name: 'Maria Nature', email: 'maria@example.com', joined: '5 hours ago', level: 5 },
    { id: 3, name: 'Sam Adventure', email: 'sam@example.com', joined: '1 day ago', level: 2 }
  ]

  const feedbackMessages = [
    { id: 1, user: 'Emma', message: 'Love the forest module!', type: 'positive', time: '1 hour ago' },
    { id: 2, user: 'James', message: 'Quiz was too hard', type: 'issue', time: '3 hours ago' },
    { id: 3, user: 'Lisa', message: 'Need more ocean content', type: 'suggestion', time: '1 day ago' }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <Users className="mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-sm">Total Users</div>
          <div className="text-xs mt-1">{stats.activeUsers} active today</div>
        </div>

        <div className="card bg-gradient-to-br from-green-400 to-green-600 text-white">
          <BookOpen className="mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.totalModules}</div>
          <div className="text-sm">Learning Modules</div>
        </div>

        <div className="card bg-gradient-to-br from-purple-400 to-purple-600 text-white">
          <BarChart3 className="mb-2" size={32} />
          <div className="text-2xl font-bold">{stats.completedQuizzes.toLocaleString()}</div>
          <div className="text-sm">Completed Quizzes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Level {user.level}</div>
                  <div className="text-xs text-gray-500">{user.joined}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Feedback</h3>
          <div className="space-y-3">
            {feedbackMessages.map((feedback) => (
              <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{feedback.user}</span>
                  <span className={`badge ${
                    feedback.type === 'positive' ? 'bg-green-100 text-green-800' :
                    feedback.type === 'issue' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{feedback.message}</div>
                <div className="text-xs text-gray-500">{feedback.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return <div className="card">User management coming soon...</div>
      case 'modules':
        return <div className="card">Module editor coming soon...</div>
      case 'feedback':
        return <div className="card">Feedback management coming soon...</div>
      case 'notifications':
        return <div className="card">Notification system coming soon...</div>
      case 'settings':
        return <div className="card">Settings panel coming soon...</div>
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-nature-green font-kid-friendly mb-2">
          ⚙️ Admin Panel
        </h1>
        <p className='text-gray-600 mb-6'>
          Welcome to the admin dashboard. Monitor system activity and manage content.
        </p>

        <QuestionBroadcaster />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-nature-green text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3" size={20} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Admin