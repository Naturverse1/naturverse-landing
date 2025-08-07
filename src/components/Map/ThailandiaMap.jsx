
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCompass } from 'react-icons/fa';
import Narrator from '../Voice/Narrator';

const regions = [
  {
    id: 'jungle-trails',
    name: 'Jungle Trails',
    emoji: '🌿',
    description: 'Dense tropical forests filled with exotic wildlife and ancient secrets.',
    difficulty: 'Medium',
    activities: ['Nature Walk', 'Wildlife Spotting', 'Tree Climbing'],
    coordinates: { x: 20, y: 30 }
  },
  {
    id: 'lotus-lake',
    name: 'Lotus Lake',
    emoji: '🏵️',
    description: 'Serene waters surrounded by beautiful lotus flowers and peaceful meditation spots.',
    difficulty: 'Easy',
    activities: ['Meditation', 'Lotus Picking', 'Water Studies'],
    coordinates: { x: 60, y: 20 }
  },
  {
    id: 'royal-canopy',
    name: 'Royal Canopy',
    emoji: '👑',
    description: 'The majestic treetops where the forest royalty holds court.',
    difficulty: 'Hard',
    activities: ['Canopy Walk', 'Royal Audience', 'Crown Quest'],
    coordinates: { x: 40, y: 60 }
  },
  {
    id: 'spicy-hills',
    name: 'Spicy Hills',
    emoji: '🌶️',
    description: 'Rolling hills where the famous Thai spices grow wild and adventures get heated!',
    difficulty: 'Medium',
    activities: ['Spice Hunt', 'Hill Climbing', 'Cooking Challenge'],
    coordinates: { x: 75, y: 70 }
  },
  {
    id: 'temple-grounds',
    name: 'Temple Grounds',
    emoji: '🏛️',
    description: 'Ancient temples holding wisdom and mysterious puzzles from ages past.',
    difficulty: 'Hard',
    activities: ['Temple Exploration', 'Riddle Solving', 'Meditation'],
    coordinates: { x: 30, y: 80 }
  },
  {
    id: 'floating-market',
    name: 'Floating Market',
    emoji: '🛶',
    description: 'Bustling waterway markets where traders sell exotic goods and local delicacies.',
    difficulty: 'Easy',
    activities: ['Trading Game', 'Boat Ride', 'Food Tasting'],
    coordinates: { x: 80, y: 40 }
  }
];

export default function ThailandiaMap({ onRegionSelect, selectedRegion = null }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRegionData, setSelectedRegionData] = useState(null);

  const handleRegionClick = (region) => {
    setSelectedRegionData(region);
    setShowDetails(true);
    if (onRegionSelect) {
      onRegionSelect(region);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-800 mb-2 flex items-center justify-center">
          <FaCompass className="mr-3" />
          🗺️ Thailandia Adventure Map
        </h2>
        <Narrator 
          text="Welcome to Thailandia, a magical land inspired by the beauty of Thailand. Choose your adventure destination!"
          className="justify-center"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-green-200 to-blue-200 rounded-lg p-4 h-96 overflow-hidden border-4 border-green-300">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-100/30 to-blue-100/30"></div>
            
            {/* Region Markers */}
            {regions.map((region) => (
              <div
                key={region.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ 
                  left: `${region.coordinates.x}%`, 
                  top: `${region.coordinates.y}%` 
                }}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div className={`relative transition-all duration-200 ${
                  selectedRegion?.id === region.id 
                    ? 'scale-150 z-20' 
                    : hoveredRegion?.id === region.id 
                    ? 'scale-125 z-10' 
                    : 'scale-100'
                }`}>
                  <div className="text-4xl animate-bounce">
                    {region.emoji}
                  </div>
                  <FaMapMarkerAlt className="text-red-500 text-xl absolute -bottom-2 left-1/2 transform -translate-x-1/2" />
                </div>

                {/* Hover Tooltip */}
                {hoveredRegion?.id === region.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap z-30">
                    <div className="font-bold text-gray-800">{region.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getDifficultyColor(region.difficulty)}`}>
                      {region.difficulty}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-2xl opacity-50">🌴</div>
            <div className="absolute bottom-4 left-4 text-2xl opacity-50">🏯</div>
            <div className="absolute top-1/2 right-8 text-xl opacity-30">🦋</div>
            <div className="absolute bottom-8 right-12 text-xl opacity-30">🐘</div>
          </div>

          {/* Region List */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedRegion?.id === region.id
                    ? 'bg-blue-100 border-blue-500 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{region.emoji}</div>
                <div className="text-xs font-bold text-gray-700">{region.name}</div>
                <div className={`text-xs px-1 rounded-full mt-1 ${getDifficultyColor(region.difficulty)}`}>
                  {region.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Details Panel */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          {selectedRegionData ? (
            <div>
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedRegionData.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800">{selectedRegionData.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm ${getDifficultyColor(selectedRegionData.difficulty)}`}>
                  Difficulty: {selectedRegionData.difficulty}
                </div>
              </div>

              <Narrator 
                text={selectedRegionData.description}
                className="mb-4"
              >
                <p className="text-gray-700 text-sm">{selectedRegionData.description}</p>
              </Narrator>

              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-2">🎯 Available Activities:</h4>
                <div className="space-y-1">
                  {selectedRegionData.activities.map((activity, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded text-sm text-green-800">
                      ✨ {activity}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onRegionSelect && onRegionSelect(selectedRegionData)}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                🚀 Start Adventure in {selectedRegionData.name}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-lg font-bold mb-2">Choose Your Destination</p>
              <p className="text-sm">Click on any location on the map to learn more about it!</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-3">🔑 Map Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">Easy</div>
            <span>Perfect for beginners</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">Medium</div>
            <span>Some challenge involved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Hard</div>
            <span>For experienced adventurers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
