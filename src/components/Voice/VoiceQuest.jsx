
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const questPrompts = [
  {
    id: 1,
    text: 'Welcome to the Enchanted Forest! You see two paths ahead. Which way do you want to go?',
    options: ['Go Left', 'Go Right', 'Stay Here'],
    keywords: ['left', 'right', 'stay', 'here']
  },
  {
    id: 2,
    text: 'You encounter a magical talking tree! It offers you a choice of gifts.',
    options: ['Magic Seed', 'Healing Potion', 'Wisdom Crystal'],
    keywords: ['seed', 'potion', 'crystal', 'magic', 'healing', 'wisdom']
  },
  {
    id: 3,
    text: 'A river blocks your path. How do you want to cross it?',
    options: ['Build Bridge', 'Swim Across', 'Find Another Way'],
    keywords: ['bridge', 'swim', 'another', 'way', 'build']
  }
];

export default function VoiceQuest({ onQuestComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questHistory, setQuestHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const currentPrompt = questPrompts[currentStep];

  const handleChoice = (option, method = 'click') => {
    const choice = {
      prompt: currentPrompt.text,
      choice: option,
      method: method,
      timestamp: new Date()
    };

    const newHistory = [...questHistory, choice];
    setQuestHistory(newHistory);
    
    setFeedback(`Great choice! You selected: ${option}`);
    resetTranscript();

    // Move to next step or complete quest
    setTimeout(() => {
      if (currentStep < questPrompts.length - 1) {
        setCurrentStep(currentStep + 1);
        setFeedback('');
      } else {
        setIsComplete(true);
        if (onQuestComplete) {
          onQuestComplete({
            history: newHistory,
            score: newHistory.length * 10,
            completed: true
          });
        }
      }
    }, 2000);
  };

  // Voice command processing
  useEffect(() => {
    if (transcript && currentPrompt && !isComplete) {
      const lowerTranscript = transcript.toLowerCase();
      
      // Check for exact option matches
      const matchedOption = currentPrompt.options.find(option =>
        lowerTranscript.includes(option.toLowerCase())
      );

      if (matchedOption) {
        handleChoice(matchedOption, 'voice');
        return;
      }

      // Check for keyword matches
      const matchedKeyword = currentPrompt.keywords.find(keyword =>
        lowerTranscript.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        const relatedOption = currentPrompt.options.find(option =>
          option.toLowerCase().includes(matchedKeyword) ||
          matchedKeyword.includes(option.toLowerCase().split(' ')[0])
        );
        
        if (relatedOption) {
          handleChoice(relatedOption, 'voice');
        }
      }
    }
  }, [transcript, currentPrompt, isComplete]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const resetQuest = () => {
    setCurrentStep(0);
    setQuestHistory([]);
    setIsComplete(false);
    setFeedback('');
    resetTranscript();
  };

  const narrateText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className='p-6 bg-red-100 rounded-lg'>
        <h2 className='text-xl font-bold text-red-800 mb-2'>🎤 Voice Quest</h2>
        <p className='text-red-700'>
          Sorry, your browser doesn't support speech recognition. 
          Please use a modern browser like Chrome or Edge.
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className='p-6 bg-green-100 rounded-lg'>
        <h2 className='text-2xl font-bold text-green-800 mb-4'>🎉 Quest Complete!</h2>
        <div className='bg-white p-4 rounded-lg mb-4'>
          <h3 className='font-bold mb-2'>Your Journey:</h3>
          {questHistory.map((entry, index) => (
            <div key={index} className='mb-2 p-2 bg-gray-50 rounded'>
              <p className='text-sm text-gray-600'>{entry.prompt}</p>
              <p className='font-bold text-green-700'>
                ➤ {entry.choice} 
                <span className='text-xs text-gray-500 ml-2'>
                  ({entry.method === 'voice' ? '🎤 Voice' : '👆 Click'})
                </span>
              </p>
            </div>
          ))}
        </div>
        <div className='text-center'>
          <p className='text-lg font-bold text-green-700 mb-2'>
            Score: {questHistory.length * 10} points!
          </p>
          <button
            onClick={resetQuest}
            className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600'
          >
            🔄 Start New Quest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-purple-800'>🎤 Voice Quest</h2>
        <div className='text-sm text-gray-600'>
          Step {currentStep + 1} of {questPrompts.length}
        </div>
      </div>

      {/* Current Prompt */}
      <div className='bg-white p-4 rounded-lg mb-4 border-l-4 border-purple-500'>
        <div className='flex justify-between items-start mb-3'>
          <p className='text-lg text-gray-800 flex-1'>{currentPrompt.text}</p>
          <button
            onClick={() => narrateText(currentPrompt.text)}
            className='ml-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200'
            title="Listen to narration"
          >
            🔊
          </button>
        </div>

        {/* Voice Controls */}
        <div className='bg-gray-50 p-3 rounded-lg mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-bold text-gray-700'>Voice Command:</span>
            <button
              onClick={listening ? SpeechRecognition.stopListening : startListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold ${
                listening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span>{listening ? 'Stop Listening' : 'Start Listening'}</span>
            </button>
          </div>
          
          {transcript && (
            <div className='bg-white p-2 rounded border'>
              <span className='text-sm text-gray-600'>You said: </span>
              <span className='font-bold text-blue-600'>"{transcript}"</span>
            </div>
          )}
          
          {listening && (
            <div className='text-center mt-2'>
              <div className='animate-pulse text-red-500 text-sm'>
                🎤 Listening... Say one of the options below
              </div>
            </div>
          )}
        </div>

        {/* Option Buttons */}
        <div className='space-y-2'>
          <p className='font-bold text-gray-700 mb-2'>Choose your action:</p>
          {currentPrompt.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleChoice(option, 'click')}
              className='w-full p-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg text-left transition-colors'
            >
              <span className='font-bold text-gray-700'>
                {String.fromCharCode(65 + index)}.
              </span>{' '}
              {option}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className='mt-4 p-3 bg-green-100 border border-green-300 rounded-lg'>
            <p className='text-green-800 font-medium'>✨ {feedback}</p>
          </div>
        )}
      </div>

      {/* Quest Progress */}
      <div className='bg-white p-3 rounded-lg'>
        <h3 className='font-bold text-gray-800 mb-2'>📜 Quest Progress</h3>
        <div className='flex items-center space-x-2'>
          {questPrompts.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full ${
                index < currentStep 
                  ? 'bg-green-500' 
                  : index === currentStep 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        {questHistory.length > 0 && (
          <div className='mt-2 text-sm text-gray-600'>
            Choices made: {questHistory.length} • Score: {questHistory.length * 10} points
          </div>
        )}
      </div>
    </div>
  );
}
