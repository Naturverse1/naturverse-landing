
import React, { useState, useEffect } from 'react';
import { regions } from '../../utils/regions';
import { useAuth } from '../../contexts/AuthContext';

export default function Companion() {
  const [selectedRegion, setSelectedRegion] = useState('Thailandia');
  const [activePet, setActivePet] = useState(null);
  const [petMood, setPetMood] = useState('happy');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const { user } = useAuth();

  const regionalPets = {
    'Thailandia': [
      { id: 1, name: 'Kiwi', species: '🐒 Monkey', personality: 'playful', specialAbility: 'Finds hidden fruits' },
      { id: 2, name: 'Lotus', species: '🐘 Elephant', personality: 'wise', specialAbility: 'Remembers all paths' },
      { id: 3, name: 'Mango', species: '🦜 Parrot', personality: 'chatty', specialAbility: 'Translates animal sounds' }
    ],
    'Brazillia': [
      { id: 4, name: 'Rio', species: '🦋 Butterfly', personality: 'graceful', specialAbility: 'Shows flower locations' },
      { id: 5, name: 'Amazon', species: '🐢 Turtle', personality: 'patient', specialAbility: 'Deep water diving' },
      { id: 6, name: 'Carnival', species: '🦎 Chameleon', personality: 'mysterious', specialAbility: 'Perfect camouflage' }
    ],
    'Europalia': [
      { id: 7, name: 'Aurora', species: '🦅 Eagle', personality: 'brave', specialAbility: 'High-altitude scouting' },
      { id: 8, name: 'Crystal', species: '🐺 Wolf', personality: 'loyal', specialAbility: 'Excellent tracking' },
      { id: 9, name: 'Frost', species: '🦌 Deer', personality: 'gentle', specialAbility: 'Finds magical herbs' }
    ]
  };

  const petActivities = [
    '🎾 Play fetch',
    '🍯 Feed treats',
    '🛁 Give a bath',
    '🎵 Sing together',
    '📚 Read stories',
    '🏃‍♂️ Go exploring'
  ];

  const moodEmojis = {
    happy: '😊',
    excited: '🤩',
    sleepy: '😴',
    hungry: '😋',
    lonely: '🥺',
    playful: '🤪'
  };

  // Simulate pet mood changes
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction;
      const moods = ['happy', 'excited', 'sleepy', 'hungry', 'lonely', 'playful'];
      
      if (timeSinceInteraction > 300000) { // 5 minutes without interaction
        setPetMood('lonely');
      } else {
        setPetMood(moods[Math.floor(Math.random() * moods.length)]);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastInteraction]);

  const adoptPet = (pet) => {
    setActivePet(pet);
    setPetMood('excited');
    setLastInteraction(Date.now());
  };

  const interactWithPet = async (activity) => {
    if (!activePet) return;

    setLastInteraction(Date.now());
    setPetMood('happy');

    // Award $NATUR tokens for pet interaction
    if (user?.id) {
      try {
        await fetch('/api/pet-interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            petId: activePet.id,
            activity,
            region: selectedRegion
          })
        });
      } catch (error) {
        console.error('Failed to record pet interaction:', error);
      }
    }

    // Show activity feedback
    alert(`${activePet.name} loved ${activity}! You earned 5 $NATUR tokens! 🪙`);
  };

  const releasePet = () => {
    if (confirm(`Are you sure you want to release ${activePet.name} back to ${selectedRegion}?`)) {
      setActivePet(null);
      setPetMood('happy');
    }
  };

  return (
    <div className='p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-green-800'>🐾 Pet Companions</h2>
        <p className='text-green-600'>Adopt and care for magical creatures from each region!</p>
      </div>

      {/* Region Selector */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Choose Region:</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {activePet ? (
        // Active Pet Display
        <div className='bg-white rounded-lg p-6 shadow-inner'>
          <div className='text-center mb-6'>
            <div className='text-6xl mb-2'>{activePet.species.split(' ')[0]}</div>
            <h3 className='text-2xl font-bold text-gray-800'>{activePet.name}</h3>
            <p className='text-gray-600'>{activePet.species}</p>
            <div className='flex items-center justify-center space-x-2 mt-2'>
              <span className='text-sm text-gray-500'>Mood:</span>
              <span className='text-2xl'>{moodEmojis[petMood]}</span>
              <span className='text-sm capitalize text-gray-700'>{petMood}</span>
            </div>
          </div>

          {/* Pet Stats */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div className='bg-gray-50 p-3 rounded-lg text-center'>
              <div className='text-sm text-gray-600'>Personality</div>
              <div className='font-semibold capitalize'>{activePet.personality}</div>
            </div>
            <div className='bg-gray-50 p-3 rounded-lg text-center'>
              <div className='text-sm text-gray-600'>Special Ability</div>
              <div className='font-semibold text-sm'>{activePet.specialAbility}</div>
            </div>
          </div>

          {/* Activities */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-800 mb-3'>Activities:</h4>
            <div className='grid grid-cols-2 gap-2'>
              {petActivities.map((activity, idx) => (
                <button
                  key={idx}
                  onClick={() => interactWithPet(activity)}
                  className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors text-sm'
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={releasePet}
            className='w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors'
          >
            🔄 Release Back to Wild
          </button>
        </div>
      ) : (
        // Pet Selection
        <div>
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>
            Available Pets in {selectedRegion}:
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {regionalPets[selectedRegion].map(pet => (
              <div key={pet.id} className='bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'>
                <div className='text-center mb-3'>
                  <div className='text-4xl mb-2'>{pet.species.split(' ')[0]}</div>
                  <h4 className='text-lg font-bold text-gray-800'>{pet.name}</h4>
                  <p className='text-sm text-gray-600'>{pet.species}</p>
                </div>
                
                <div className='space-y-2 mb-4'>
                  <div className='text-xs'>
                    <strong>Personality:</strong> <span className='capitalize'>{pet.personality}</span>
                  </div>
                  <div className='text-xs'>
                    <strong>Ability:</strong> {pet.specialAbility}
                  </div>
                </div>

                <button
                  onClick={() => adoptPet(pet)}
                  className='w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors'
                >
                  🏠 Adopt {pet.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
