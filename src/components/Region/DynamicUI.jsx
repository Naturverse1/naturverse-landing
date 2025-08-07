
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DynamicUI({ selectedRegion = 'forest', questData = null, onRegionChange }) {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [weatherEffect, setWeatherEffect] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState('');
  const [interactiveElements, setInteractiveElements] = useState([]);
  const { user } = useAuth();

  const regionConfigs = {
    forest: {
      name: 'Enchanted Forest',
      emoji: '🌲',
      colors: {
        primary: 'from-green-400 to-emerald-600',
        secondary: 'from-green-100 to-emerald-100',
        accent: 'green-500',
        text: 'green-800'
      },
      weather: 'light-rain',
      ambience: 'forest-birds.mp3',
      elements: [
        { type: 'tree', emoji: '🌳', clickable: true, sound: 'rustling' },
        { type: 'flower', emoji: '🌸', clickable: true, sound: 'gentle-chime' },
        { type: 'mushroom', emoji: '🍄', clickable: true, sound: 'magic-sparkle' },
        { type: 'butterfly', emoji: '🦋', animated: true, sound: 'flutter' }
      ],
      npcs: [
        { name: 'Forest Guardian', emoji: '🧙‍♂️', role: 'guide' },
        { name: 'Wise Owl', emoji: '🦉', role: 'tutor' }
      ]
    },
    ocean: {
      name: 'Ocean Depths',
      emoji: '🌊',
      colors: {
        primary: 'from-blue-400 to-cyan-600',
        secondary: 'from-blue-100 to-cyan-100',
        accent: 'blue-500',
        text: 'blue-800'
      },
      weather: 'gentle-waves',
      ambience: 'ocean-waves.mp3',
      elements: [
        { type: 'wave', emoji: '🌊', animated: true, sound: 'wave-crash' },
        { type: 'shell', emoji: '🐚', clickable: true, sound: 'ocean-echo' },
        { type: 'coral', emoji: '🪸', clickable: true, sound: 'underwater-chime' },
        { type: 'fish', emoji: '🐠', animated: true, sound: 'bubble' }
      ],
      npcs: [
        { name: 'Coral Keeper', emoji: '🧜‍♀️', role: 'guide' },
        { name: 'Wise Turtle', emoji: '🐢', role: 'tutor' }
      ]
    },
    mountain: {
      name: 'Sky Mountains',
      emoji: '🏔️',
      colors: {
        primary: 'from-gray-400 to-slate-600',
        secondary: 'from-gray-100 to-slate-100',
        accent: 'slate-500',
        text: 'slate-800'
      },
      weather: 'mountain-wind',
      ambience: 'mountain-wind.mp3',
      elements: [
        { type: 'peak', emoji: '⛰️', clickable: true, sound: 'echo' },
        { type: 'snow', emoji: '❄️', animated: true, sound: 'wind-chime' },
        { type: 'crystal', emoji: '💎', clickable: true, sound: 'crystal-ring' },
        { type: 'eagle', emoji: '🦅', animated: true, sound: 'eagle-cry' }
      ],
      npcs: [
        { name: 'Mountain Spirit', emoji: '🗿', role: 'guide' },
        { name: 'Sky Phoenix', emoji: '🔥', role: 'tutor' }
      ]
    },
    desert: {
      name: 'Golden Desert',
      emoji: '🏜️',
      colors: {
        primary: 'from-yellow-400 to-orange-600',
        secondary: 'from-yellow-100 to-orange-100',
        accent: 'yellow-500',
        text: 'orange-800'
      },
      weather: 'desert-heat',
      ambience: 'desert-wind.mp3',
      elements: [
        { type: 'dune', emoji: '🏔️', clickable: true, sound: 'sand-shift' },
        { type: 'cactus', emoji: '🌵', clickable: true, sound: 'desert-chime' },
        { type: 'oasis', emoji: '💧', clickable: true, sound: 'water-drop' },
        { type: 'scarab', emoji: '🪲', animated: true, sound: 'insect-buzz' }
      ],
      npcs: [
        { name: 'Desert Sage', emoji: '🧙‍♂️', role: 'guide' },
        { name: 'Sun Falcon', emoji: '🦅', role: 'tutor' }
      ]
    }
  };

  useEffect(() => {
    const region = regionConfigs[selectedRegion];
    if (region) {
      setCurrentTheme(region);
      setWeatherEffect(region.weather);
      setBackgroundMusic(region.ambience);
      setInteractiveElements(region.elements);
    }
  }, [selectedRegion]);

  const handleElementClick = (element, index) => {
    if (!element.clickable) return;
    
    // Simulate interaction feedback
    const updatedElements = [...interactiveElements];
    updatedElements[index] = { ...element, clicked: true, clickTime: Date.now() };
    setInteractiveElements(updatedElements);

    // Play sound effect (simulated)
    console.log(`Playing sound: ${element.sound}`);
    
    // Reset click state after animation
    setTimeout(() => {
      const resetElements = [...updatedElements];
      resetElements[index] = { ...element, clicked: false };
      setInteractiveElements(resetElements);
    }, 1000);
  };

  const RegionSelector = () => (
    <div className='mb-6'>
      <h3 className='text-lg font-bold mb-3 text-gray-800'>🗺️ Choose Your Adventure Region</h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {Object.entries(regionConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onRegionChange && onRegionChange(key)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedRegion === key 
                ? `bg-gradient-to-br ${config.colors.primary} text-white border-white shadow-lg`
                : `bg-gradient-to-br ${config.colors.secondary} border-gray-300 hover:shadow-md`
            }`}
          >
            <div className='text-3xl mb-2'>{config.emoji}</div>
            <div className={`font-bold text-sm ${selectedRegion === key ? 'text-white' : `text-${config.colors.text}`}`}>
              {config.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const InteractiveEnvironment = () => (
    <div className={`p-6 rounded-lg bg-gradient-to-br ${currentTheme?.colors.secondary} border border-gray-200 relative overflow-hidden`}>
      <div className='absolute inset-0 pointer-events-none'>
        {/* Weather Effects */}
        {weatherEffect === 'light-rain' && (
          <div className='rain-effect'>
            {[...Array(20)].map((_, i) => (
              <div key={i} className='raindrop' style={{left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`}}>💧</div>
            ))}
          </div>
        )}
        {weatherEffect === 'gentle-waves' && (
          <div className='wave-effect animate-pulse opacity-30'>
            <div className='text-6xl text-blue-400'>〰️〰️〰️</div>
          </div>
        )}
        {weatherEffect === 'mountain-wind' && (
          <div className='wind-effect'>
            <div className='text-2xl text-gray-400 animate-ping'>💨</div>
          </div>
        )}
        {weatherEffect === 'desert-heat' && (
          <div className='heat-effect'>
            <div className='text-4xl text-yellow-400 animate-bounce opacity-50'>☀️</div>
          </div>
        )}
      </div>

      <div className='relative z-10'>
        <h2 className={`text-2xl font-bold mb-4 text-${currentTheme?.colors.text} flex items-center`}>
          <span className='text-3xl mr-3'>{currentTheme?.emoji}</span>
          Welcome to {currentTheme?.name}
        </h2>
        
        {/* Interactive Elements */}
        <div className='grid grid-cols-4 gap-4 mb-6'>
          {interactiveElements.map((element, index) => (
            <div
              key={index}
              onClick={() => handleElementClick(element, index)}
              className={`text-center p-3 rounded-lg cursor-pointer transition-all hover:scale-110 ${
                element.clicked ? 'animate-pulse bg-yellow-200' : 'hover:bg-white/50'
              } ${element.clickable ? 'cursor-pointer' : 'cursor-default'}`}
              title={`${element.type} - ${element.clickable ? 'Click to interact!' : 'Decoration'}`}
            >
              <div className={`text-4xl mb-1 ${element.animated ? 'animate-bounce' : ''}`}>
                {element.emoji}
              </div>
              <div className='text-xs text-gray-600 capitalize'>{element.type}</div>
            </div>
          ))}
        </div>

        {/* NPCs */}
        <div className='mb-6'>
          <h3 className={`text-lg font-bold mb-3 text-${currentTheme?.colors.text}`}>🤝 Meet the Locals</h3>
          <div className='flex space-x-4'>
            {currentTheme?.npcs.map((npc, index) => (
              <div key={index} className='bg-white/70 p-3 rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer'>
                <div className='text-3xl mb-2 animate-bounce'>{npc.emoji}</div>
                <div className='text-sm font-bold text-gray-800'>{npc.name}</div>
                <div className='text-xs text-gray-600 capitalize'>{npc.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quest Integration */}
        {questData && (
          <div className='bg-white/80 p-4 rounded-lg border-l-4 border-green-500'>
            <h3 className='font-bold text-gray-800 mb-2'>🎯 Active Quest</h3>
            <p className='text-sm text-gray-700 mb-2'>
              {questData.question || 'Exploring the wonders of ' + currentTheme?.name}
            </p>
            <div className='text-xs text-gray-600'>
              Region: {currentTheme?.name} • Difficulty: {questData.difficulty || 'Medium'}
            </div>
          </div>
        )}

        {/* Environmental Info */}
        <div className='mt-6 bg-white/60 p-4 rounded-lg'>
          <h3 className={`text-lg font-bold mb-2 text-${currentTheme?.colors.text}`}>🌍 Environment Info</h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-bold'>Weather:</span> {weatherEffect.replace('-', ' ')}
            </div>
            <div>
              <span className='font-bold'>Ambience:</span> {backgroundMusic.replace('.mp3', '').replace('-', ' ')}
            </div>
            <div>
              <span className='font-bold'>Interactive Objects:</span> {interactiveElements.filter(e => e.clickable).length}
            </div>
            <div>
              <span className='font-bold'>Local Guides:</span> {currentTheme?.npcs.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentTheme) {
    return (
      <div className='p-6 text-center'>
        <div className='text-4xl mb-4'>🌍</div>
        <p className='text-gray-600'>Loading magical environment...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <RegionSelector />
      <InteractiveEnvironment />
    </div>
  );
}
