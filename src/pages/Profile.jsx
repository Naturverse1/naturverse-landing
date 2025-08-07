import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Award, Trophy, Star, Edit2, Save } from 'lucide-react'
import ConnectWallet from './components/ConnectWallet';

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: user?.user_metadata?.username || 'Nature Explorer',
    bio: 'I love exploring the natural world!',
    favoriteRegion: 'forest',
    level: 5
  })

  const stats = {
    totalStamps: 8,
    quizzesCompleted: 12,
    modulesFinished: 15,
    averageScore: 87
  }

  const stamps = [
    { id: 1, name: 'Forest Explorer', emoji: '🌲', region: 'forest' },
    { id: 2, name: 'Ocean Diver', emoji: '🌊', region: 'ocean' },
    { id: 3, name: 'Mountain Climber', emoji: '🏔️', region: 'mountain' },
    { id: 4, name: 'Animal Friend', emoji: '🦋', region: 'forest' },
    { id: 5, name: 'Plant Expert', emoji: '🌱', region: 'forest' },
    { id: 6, name: 'Weather Watcher', emoji: '⛈️', region: 'mountain' },
    { id: 7, name: 'Star Gazer', emoji: '⭐', region: 'mountain' },
    { id: 8, name: 'Nature Photographer', emoji: '📸', region: 'all' }
  ]

  const achievements = [
    { name: 'First Steps', description: 'Completed your first module', icon: '👶' },
    { name: 'Quiz Master', description: 'Scored 100% on a quiz', icon: '🎯' },
    { name: 'Stamp Collector', description: 'Earned 5 stamps', icon: '🏅' },
    { name: 'Explorer', description: 'Visited all regions', icon: '🗺️' }
  ]

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false)
    alert('Profile updated! 🎉')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card text-center">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            👤
          </div>
          <div className={`absolute top-0 right-0 badge bg-nature-green text-white px-3 py-1`}>
            Level {profile.level}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 max-w-md mx-auto">
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({...profile, username: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Username"
            />
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Bio"
              rows={3}
            />
            <select
              value={profile.favoriteRegion}
              onChange={(e) => setProfile({...profile, favoriteRegion: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="forest">🌲 Forest</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="mountain">🏔️ Mountain</option>
              <option value="desert">🏜️ Desert</option>
            </select>
            <button onClick={handleSave} className="btn-primary flex items-center mx-auto">
              <Save className="mr-2" size={20} />
              Save Changes
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.username}</h1>
            <p className="text-gray-600 mb-4">{profile.bio}</p>
            <p className="text-sm text-gray-500 mb-4">
              Favorite Region: {profile.favoriteRegion === 'forest' ? '🌲 Forest' : 
                               profile.favoriteRegion === 'ocean' ? '🌊 Ocean' : 
                               profile.favoriteRegion === 'mountain' ? '🏔️ Mountain' : '🏜️ Desert'}
            </p>
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center mx-auto"
            >
              <Edit2 className="mr-2" size={20} />
              Edit Profile
            </button>
          </div>
        )}
      </div>

        {/* Wallet Connection */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🔗 Connect Your Wallet</h3>
          <p className="text-sm text-gray-500 mb-4">Link your crypto wallet to earn token rewards and collect NFT badges!</p>
          <ConnectWallet />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center bg-gradient-to-br from-green-100 to-green-200">
          <Award className="mx-auto mb-2 text-nature-green" size={32} />
          <div className="text-2xl font-bold">{stats.totalStamps}</div>
          <div className="text-sm text-gray-600">Stamps Earned</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-blue-100 to-blue-200">
          <Trophy className="mx-auto mb-2 text-nature-blue" size={32} />
          <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
          <div className="text-sm text-gray-600">Quizzes Done</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-purple-100 to-purple-200">
          <Star className="mx-auto mb-2 text-nature-purple" size={32} />
          <div className="text-2xl font-bold">{stats.modulesFinished}</div>
          <div className="text-sm text-gray-600">Modules Complete</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-orange-100 to-orange-200">
          <User className="mx-auto mb-2 text-nature-orange" size={32} />
          <div className="text-2xl font-bold">{stats.averageScore}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
      </div>

      {/* Stamps Collection */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Award className="mr-2" />
          My Stamp Collection
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stamps.map((stamp) => (
            <div key={stamp.id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{stamp.emoji}</div>
              <div className="text-sm font-medium">{stamp.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Trophy className="mr-2" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl mr-4">{achievement.icon}</div>
              <div>
                <div className="font-bold text-gray-800">{achievement.name}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile