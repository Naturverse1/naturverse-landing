
import React, { useState } from 'react';
import WordMatchGame from '../../components/Games/WordMatchGame';
import { useAuth } from '../../contexts/AuthContext';

export default function GameZone() {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState(0);

  const games = [
    {
      question: 'Which fruit is green and spiky?',
      answers: ['Banana', 'Durian', 'Mango', 'Apple']
    },
    {
      question: 'What animal says "Dee mak!" in The Naturverse?',
      answers: ['Elephant', 'Turian Turtle', 'Monkey', 'Bird']
    },
    {
      question: 'Which region has the golden sands?',
      answers: ['Ocean Depths', 'Enchanted Forest', 'Golden Desert', 'Sky Mountains']
    }
  ];

  const nextGame = () => {
    setCurrentGame(prev => (prev + 1) % games.length);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold text-center mb-8 text-purple-800'>
          🎮 Naturverse Game Zone
        </h1>
        
        <div className='bg-white rounded-lg shadow-xl p-6 mb-6'>
          <WordMatchGame 
            question={games[currentGame].question}
            answers={games[currentGame].answers}
          />
          
          <div className='flex justify-center mt-6'>
            <button
              onClick={nextGame}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors'
            >
              Next Game ➡️
            </button>
          </div>
        </div>
        
        <div className='text-center'>
          <p className='text-gray-600'>
            Welcome, {user?.email || 'Explorer'}! Complete games to earn $NATUR tokens!
          </p>
        </div>
      </div>
    </div>
  );
}
