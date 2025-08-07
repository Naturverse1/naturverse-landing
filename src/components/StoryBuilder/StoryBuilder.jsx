
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function StoryBuilder() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const generateStory = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/turian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Create a magical story about: ${prompt}. Make it fun and educational for kids in The Naturverse!`,
          userId: user?.id,
          language: 'en'
        })
      });
      
      const data = await res.json();
      setStory(data.message || 'Story generation failed. Try again!');
    } catch (error) {
      setStory('Error generating story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4 text-nature-green'>📝 AI Story Builder</h2>
      <div className='space-y-4'>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Type your story idea... (e.g., "A magical turtle who teaches about rainforests")'
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent'
          rows="3"
        />
        <button
          onClick={generateStory}
          disabled={isGenerating || !prompt.trim()}
          className='bg-nature-green text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isGenerating ? 'Generating Story...' : 'Generate Magical Story'}
        </button>
        {story && (
          <div className='mt-6 p-4 bg-green-50 rounded-lg border border-green-200'>
            <h3 className='font-semibold text-green-800 mb-2'>Your Magical Story:</h3>
            <div className='whitespace-pre-line text-gray-700'>{story}</div>
          </div>
        )}
      </div>
    </div>
  );
}
