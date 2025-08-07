
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Confetti from 'react-confetti';

export default function GiftCodeRedemption() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();

  const validCodes = {
    'NATUR100': { reward: 100, type: '$NATUR', description: '100 $NATUR tokens' },
    'WELCOME2024': { reward: 50, type: '$NATUR', description: '50 $NATUR welcome bonus' },
    'EXPLORER': { reward: 1, type: 'item', description: 'Explorer Badge NFT' },
    'TURIAN': { reward: 75, type: '$NATUR', description: '75 $NATUR from Turian' }
  };

  const redeem = async () => {
    if (!code.trim()) {
      setMessage('❌ Please enter a code.');
      setIsSuccess(false);
      return;
    }

    setIsRedeeming(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const upperCode = code.toUpperCase();
    const reward = validCodes[upperCode];

    if (reward) {
      setMessage(`🎁 Success! You unlocked ${reward.description}!`);
      setIsSuccess(true);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
      
      // TODO: Save reward to user's account via API
      if (user?.id) {
        try {
          await fetch('/api/redeem-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              code: upperCode,
              reward
            })
          });
        } catch (error) {
          console.error('Failed to save reward:', error);
        }
      }
    } else {
      setMessage('❌ Invalid code. Check your spelling and try again.');
      setIsSuccess(false);
    }
    
    setIsRedeeming(false);
    setCode('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      redeem();
    }
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg relative'>
      {showConfetti && (
        <Confetti
          width={400}
          height={300}
          recycle={false}
          numberOfPieces={100}
        />
      )}
      
      <h2 className='text-2xl font-bold mb-4 text-nature-green'>🎁 Redeem Gift Code</h2>
      
      <div className='space-y-4'>
        <div className='flex space-x-2'>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Enter your gift code'
            className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent uppercase'
            disabled={isRedeeming}
          />
          <button
            onClick={redeem}
            disabled={isRedeeming || !code.trim()}
            className='bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-lg ${isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
              {message}
            </p>
          </div>
        )}
        
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='font-semibold text-gray-700 mb-2'>💡 Try these sample codes:</h3>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <span className='bg-white px-2 py-1 rounded border'>NATUR100</span>
            <span className='bg-white px-2 py-1 rounded border'>WELCOME2024</span>
            <span className='bg-white px-2 py-1 rounded border'>EXPLORER</span>
            <span className='bg-white px-2 py-1 rounded border'>TURIAN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
