
import React, { useState, useEffect } from 'react';
import { regions } from '../../utils/regions';

export default function WeatherWidget() {
  const [selectedRegion, setSelectedRegion] = useState('Thailandia');
  const [weather, setWeather] = useState(null);

  const weatherData = {
    'Thailandia': {
      temp: 32,
      condition: 'Sunny',
      emoji: '🌞',
      description: 'Perfect weather for exploring tropical rainforests!'
    },
    'Brazillia': {
      temp: 28,
      condition: 'Partly Cloudy',
      emoji: '⛅',
      description: 'Great conditions for Amazon adventures!'
    },
    'Europalia': {
      temp: 18,
      condition: 'Rainy',
      emoji: '🌧️',
      description: 'Cozy weather for indoor learning activities!'
    }
  };

  useEffect(() => {
    setWeather(weatherData[selectedRegion]);
  }, [selectedRegion]);

  return (
    <div className='bg-gradient-to-br from-blue-200 to-blue-300 p-4 rounded-lg shadow-lg'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold text-blue-800'>🌦️ Regional Weather</h3>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className='px-2 py-1 text-sm bg-white rounded border border-blue-300 focus:ring-2 focus:ring-blue-500'
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>
      
      {weather && (
        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl'>{weather.emoji}</span>
            <div>
              <p className='font-semibold text-blue-900'>{weather.condition}</p>
              <p className='text-xl font-bold text-blue-800'>{weather.temp}°C</p>
            </div>
          </div>
          <p className='text-sm text-blue-700 italic'>{weather.description}</p>
        </div>
      )}
    </div>
  );
}
