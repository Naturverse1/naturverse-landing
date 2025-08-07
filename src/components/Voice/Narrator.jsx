
import React, { useState } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPause, FaPlay } from 'react-icons/fa';

export default function Narrator({ 
  text, 
  voice = 'en-US', 
  rate = 0.8, 
  pitch = 1.0,
  className = '',
  children 
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = voice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
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
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!text && !children) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {children && (
        <div className="flex-1">
          {children}
        </div>
      )}
      
      <div className="flex items-center space-x-1">
        {!isSpeaking ? (
          <button
            onClick={speak}
            className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-1"
            title="Read aloud"
          >
            <FaVolumeUp />
            <span className="text-sm">Narrate</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            {!isPaused ? (
              <button
                onClick={pause}
                className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                title="Pause narration"
              >
                <FaPause />
                <span className="text-sm">Pause</span>
              </button>
            ) : (
              <button
                onClick={resume}
                className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
                title="Resume narration"
              >
                <FaPlay />
                <span className="text-sm">Resume</span>
              </button>
            )}
            
            <button
              onClick={stop}
              className="bg-red-100 text-red-700 px-2 py-2 rounded-lg hover:bg-red-200 transition-colors"
              title="Stop narration"
            >
              <FaVolumeMute />
            </button>
          </div>
        )}
      </div>

      {isSpeaking && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">Speaking...</span>
        </div>
      )}
    </div>
  );
}
