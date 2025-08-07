
import React, { useState } from 'react'
import { BookOpen, Play, Gamepad2, Star, Lock } from 'lucide-react'

const Learning = () => {
  const [selectedRegion, setSelectedRegion] = useState('all')

  const regions = [
    { id: 'all', name: 'All Regions', emoji: '🌍' },
    { id: 'forest', name: 'Enchanted Forest', emoji: '🌲' },
    { id: 'ocean', name: 'Ocean Depths', emoji: '🌊' },
    { id: 'mountain', name: 'Sky Mountains', emoji: '🏔️' },
    { id: 'desert', name: 'Golden Desert', emoji: '🏜️' }
  ]

  const modules = [
    {
      id: 1,
      title: 'Forest Friends',
      region: 'forest',
      type: 'storybook',
      difficulty: 'Easy',
      duration: '10 min',
      unlocked: true,
      completed: true,
      description: 'Meet the animals living in our magical forest!'
    },
    {
      id: 2,
      title: 'Ocean Adventures',
      region: 'ocean',
      type: 'video',
      difficulty: 'Medium',
      duration: '15 min',
      unlocked: true,
      completed: false,
      description: 'Dive deep into the underwater world.'
    },
    {
      id: 3,
      title: 'Mountain Climbing Game',
      region: 'mountain',
      type: 'game',
      difficulty: 'Hard',
      duration: '20 min',
      unlocked: false,
      completed: false,
      description: 'Help our explorer reach the mountain peak!'
    }
  ]

  const filteredModules = selectedRegion === 'all' 
    ? modules 
    : modules.filter(m => m.region === selectedRegion)

  const getTypeIcon = (type) => {
    switch (type) {
      case 'storybook': return BookOpen
      case 'video': return Play
      case 'game': return Gamepad2
      default: return BookOpen
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'storybook': return 'bg-green-100 text-green-800'
      case 'video': return 'bg-blue-100 text-blue-800'
      case 'game': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nature-green font-kid-friendly mb-2">
          📚 Learning Adventures
        </h1>
        <p className="text-gray-600">Choose your adventure and start exploring!</p>
      </div>

      {/* Region Filter */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Choose Your Region</h2>
        <div className="flex flex-wrap gap-3">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                selectedRegion === region.id
                  ? 'bg-nature-green text-white transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2 text-xl">{region.emoji}</span>
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const TypeIcon = getTypeIcon(module.type)
          
          return (
            <div
              key={module.id}
              className={`card relative overflow-hidden transition-all hover:shadow-xl ${
                module.unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50'
              }`}
            >
              {!module.unlocked && (
                <div className="absolute top-4 right-4 z-10">
                  <Lock className="text-gray-400" size={24} />
                </div>
              )}

              {module.completed && (
                <div className="absolute top-4 left-4 z-10">
                  <Star className="text-yellow-500 fill-current" size={24} />
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${getTypeColor(module.type)}`}>
                    <TypeIcon className="mr-1" size={16} />
                    {module.type}
                  </span>
                  <span className="text-sm text-gray-500">{module.duration}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`badge ${
                    module.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    module.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {module.difficulty}
                  </span>
                  
                  <button
                    disabled={!module.unlocked}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      module.unlocked
                        ? 'bg-nature-green text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {module.completed ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No modules in this region yet!</h3>
          <p className="text-gray-600">More adventures coming soon...</p>
        </div>
      )}
    </div>
  )
}

export default Learning
