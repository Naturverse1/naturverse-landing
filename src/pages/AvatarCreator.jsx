
import React, { useState } from 'react'
import { Palette, User, Shirt, Eye, Save } from 'lucide-react'

const AvatarCreator = () => {
  const [selectedCategory, setSelectedCategory] = useState('face')
  const [avatar, setAvatar] = useState({
    face: 'face1',
    hair: 'hair1',
    outfit: 'outfit1',
    accessory: 'none'
  })

  const categories = [
    { id: 'face', name: 'Face', icon: User },
    { id: 'hair', name: 'Hair', icon: Eye },
    { id: 'outfit', name: 'Outfit', icon: Shirt },
    { id: 'accessory', name: 'Accessory', icon: Palette }
  ]

  const options = {
    face: [
      { id: 'face1', emoji: '😊', name: 'Happy' },
      { id: 'face2', emoji: '🤓', name: 'Smart' },
      { id: 'face3', emoji: '😎', name: 'Cool' },
      { id: 'face4', emoji: '🤗', name: 'Friendly' }
    ],
    hair: [
      { id: 'hair1', emoji: '👱', name: 'Blonde' },
      { id: 'hair2', emoji: '👩‍🦰', name: 'Red' },
      { id: 'hair3', emoji: '👩‍🦱', name: 'Curly' },
      { id: 'hair4', emoji: '👩‍🦲', name: 'Bald' }
    ],
    outfit: [
      { id: 'outfit1', emoji: '🌿', name: 'Nature Explorer' },
      { id: 'outfit2', emoji: '🏔️', name: 'Mountain Climber' },
      { id: 'outfit3', emoji: '🌊', name: 'Ocean Diver' },
      { id: 'outfit4', emoji: '🌸', name: 'Garden Helper' }
    ],
    accessory: [
      { id: 'none', emoji: '', name: 'None' },
      { id: 'hat1', emoji: '🎩', name: 'Explorer Hat' },
      { id: 'glasses1', emoji: '🤓', name: 'Smart Glasses' },
      { id: 'crown1', emoji: '👑', name: 'Nature Crown' }
    ]
  }

  const handleSave = () => {
    // Save avatar to local storage or backend
    localStorage.setItem('userAvatar', JSON.stringify(avatar))
    alert('Avatar saved! 🎉')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nature-green font-kid-friendly mb-2">
          🎨 Create Your Avatar
        </h1>
        <p className="text-gray-600">Design your unique nature explorer character!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Preview */}
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-6">Your Avatar</h2>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-48 h-48 mx-auto flex items-center justify-center text-6xl mb-6">
            {options.face.find(f => f.id === avatar.face)?.emoji}
            {options.hair.find(h => h.id === avatar.hair)?.emoji}
            {options.outfit.find(o => o.id === avatar.outfit)?.emoji}
            {avatar.accessory !== 'none' && options.accessory.find(a => a.id === avatar.accessory)?.emoji}
          </div>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center mx-auto"
          >
            <Save className="mr-2" size={20} />
            Save Avatar
          </button>
        </div>

        {/* Customization Options */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Customize</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-nature-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="mr-2" size={20} />
                {category.name}
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {options[selectedCategory].map((option) => (
              <button
                key={option.id}
                onClick={() => setAvatar(prev => ({ ...prev, [selectedCategory]: option.id }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  avatar[selectedCategory] === option.id
                    ? 'border-nature-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarCreator
