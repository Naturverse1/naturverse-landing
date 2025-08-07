
import React, { useState } from 'react';

export default function WordMatchGame({ question, answers }) {
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleSelection = (answer) => {
    setSelected(answer);
    setAttempts(prev => prev + 1);
    
    // Simple scoring logic - you can customize this
    if (answer === answers[1]) { // Assuming second answer is correct for demo
      setScore(prev => prev + 10);
    }
  };

  return (
    <div className='p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4 text-orange-800'>🧠 Word Match Game</h2>
      <p className='text-lg mb-4 text-gray-700'>{question}</p>
      
      <div className='flex flex-wrap gap-3 mt-4'>
        {answers.map((answer, index) => (
          <button 
            key={index} 
            onClick={() => handleSelection(answer)} 
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              selected === answer 
                ? 'bg-nature-green text-white transform scale-105' 
                : 'bg-yellow-300 hover:bg-yellow-400 text-gray-800'
            }`}
          >
            {answer}
          </button>
        ))}
      </div>
      
      {selected && (
        <div className='mt-4 p-4 bg-white rounded-lg border-l-4 border-nature-green'>
          <p className='font-semibold'>You selected: <strong className='text-nature-green'>{selected}</strong></p>
          <p className='text-sm text-gray-600'>Score: {score} | Attempts: {attempts}</p>
        </div>
      )}
    </div>
  );
}
