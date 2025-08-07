
import React, { useState } from 'react';

export default function StoryNarrator({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for kids
      utterance.pitch = 1.1; // Slightly higher pitch for friendly tone
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech!');
    }
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className='flex items-center space-x-2'>
      {!isPlaying ? (
        <button
          onClick={speak}
          className='bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 flex items-center space-x-1'
          title="Read story aloud"
        >
          <span>🔊</span>
          <span className='text-sm'>Narrate</span>
        </button>
      ) : (
        <div className='flex space-x-1'>
          {isPaused ? (
            <button
              onClick={resume}
              className='bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600'
              title="Resume"
            >
              ▶️
            </button>
          ) : (
            <button
              onClick={pause}
              className='bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600'
              title="Pause"
            >
              ⏸️
            </button>
          )}
          <button
            onClick={stop}
            className='bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600'
            title="Stop"
          >
            ⏹️
          </button>
        </div>
      )}
    </div>
  );
}
