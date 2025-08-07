
import React, { useState } from 'react';

export default function QuestionBroadcaster() {
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');

  async function sendQuestion() {
    try {
      const res = await fetch('/api/broadcast-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, answer })
      });
      const data = await res.json();
      setStatus('✅ Question sent to arena!');
      setText('');
      setAnswer('');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Failed to send question');
      setTimeout(() => setStatus(''), 3000);
    }
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6 mt-6'>
      <h2 className='text-xl font-bold mb-4 text-purple-800'>
        🎤 Broadcast Arena Question
      </h2>
      
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Question
          </label>
          <input
            className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Enter the quiz question...'
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Correct Answer
          </label>
          <input
            className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Enter the correct answer...'
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />
        </div>
        
        <div className='flex items-center justify-between'>
          <button
            onClick={sendQuestion}
            disabled={!text || !answer}
            className='bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors'
          >
            🚀 Send to Arena
          </button>
          
          {status && (
            <span className={`font-medium ${
              status.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
