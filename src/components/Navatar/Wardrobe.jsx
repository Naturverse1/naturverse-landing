
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('clothing');
  const [selectedOutfit, setSelectedOutfit] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const { user } = useAuth();

  const wardrobeItems = {
    clothing: [
      { id: 1, name: '🧥 Jungle Explorer Cloak', rarity: 'Common', region: 'Thailandia' },
      { id: 2, name: '🎎 Sacred Lotus Robe', rarity: 'Rare', region: 'Thailandia' },
      { id: 3, name: '🦁 Lion Guardian Armor', rarity: 'Epic', region: 'Brazillia' },
      { id: 4, name: '❄️ Crystal Ice Coat', rarity: 'Legendary', region: 'Europalia' }
    ],
    accessories: [
      { id: 5, name: '🎭 Festival Mask', rarity: 'Rare', region: 'Brazillia' },
      { id: 6, name: '👑 Nature Crown', rarity: 'Epic', region: 'All' },
      { id: 7, name: '🔮 Wisdom Orb', rarity: 'Legendary', region: 'All' },
      { id: 8, name: '🌸 Flower Crown', rarity: 'Common', region: 'Thailandia' }
    ],
    pets: [
      { id: 9, name: '🐢 Baby Turtle', rarity: 'Common', region: 'All' },
      { id: 10, name: '🦋 Rainbow Butterfly', rarity: 'Rare', region: 'Thailandia' },
      { id: 11, name: '🦎 Chameleon Buddy', rarity: 'Epic', region: 'Brazillia' },
      { id: 12, name: '🦅 Eagle Companion', rarity: 'Legendary', region: 'Europalia' }
    ]
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100';
      case 'Rare': return 'text-blue-600 bg-blue-100';
      case 'Epic': return 'text-purple-600 bg-purple-100';
      case 'Legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectItem = (item) => {
    setSelectedOutfit(prev => ({
      ...prev,
      [selectedCategory]: item
    }));
  };

  const saveOutfit = async () => {
    if (user?.id) {
      try {
        await fetch('/api/navatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            outfit: selectedOutfit
          })
        });
        alert('Navatar outfit saved! 🎨');
      } catch (error) {
        console.error('Failed to save outfit:', error);
      }
    }
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-nature-green'>🎨 Navatar Wardrobe</h2>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className='bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600'
        >
          {previewMode ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      {previewMode ? (
        <div className='text-center space-y-4'>
          <div className='bg-gradient-to-b from-sky-200 to-green-200 p-8 rounded-lg'>
            <div className='text-6xl mb-4'>🧙‍♂️</div>
            <div className='space-y-2'>
              {Object.entries(selectedOutfit).map(([category, item]) => (
                <div key={category} className='text-sm bg-white p-2 rounded'>
                  <strong>{category}:</strong> {item.name}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={saveOutfit}
            className='bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold'
          >
            💾 Save Outfit
          </button>
        </div>
      ) : (
        <div>
          {/* Category Tabs */}
          <div className='flex space-x-2 mb-6'>
            {Object.keys(wardrobeItems).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-nature-green text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {wardrobeItems[selectedCategory].map(item => (
              <div
                key={item.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOutfit[selectedCategory]?.id === item.id
                    ? 'border-nature-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectItem(item)}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-lg'>{item.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>Region: {item.region}</div>
              </div>
            ))}
          </div>

          {/* Current Selection Summary */}
          {Object.keys(selectedOutfit).length > 0 && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-semibold mb-2'>Current Outfit:</h3>
              <div className='space-y-1'>
                {Object.entries(selectedOutfit).map(([category, item]) => (
                  <div key={category} className='text-sm'>
                    <strong className='capitalize'>{category}:</strong> {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
