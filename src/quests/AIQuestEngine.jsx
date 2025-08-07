
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const sampleQuests = [
  { 
    id: 1, 
    question: 'Turian sees a forked trail. Which path should he take?', 
    choices: ['Left through the Enchanted Forest 🌲', 'Right toward the Ocean Depths 🌊'],
    region: 'crossroads'
  },
  { 
    id: 2, 
    question: 'A wise frog blocks your path and demands a riddle answer.', 
    choices: ['Answer with nature wisdom 🐸', 'Offer magical berries 🍓', 'Try to sneak past 🤫'],
    region: 'forest'
  },
  { 
    id: 3, 
    question: 'You discover a hidden cave with mysterious glowing crystals.', 
    choices: ['Touch the crystals ✨', 'Study them carefully 🔍', 'Leave them alone 🚪'],
    region: 'mountain'
  }
];

export default function AIQuestEngine({ onQuestComplete, selectedRegion = 'all' }) {
  const [currentQuest, setCurrentQuest] = useState(null);
  const [step, setStep] = useState(0);
  const [questLog, setQuestLog] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuests, setAiQuests] = useState([]);
  const [score, setScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    initializeQuest();
  }, [selectedRegion]);

  const initializeQuest = () => {
    const availableQuests = selectedRegion === 'all' 
      ? sampleQuests 
      : sampleQuests.filter(q => q.region === selectedRegion);
    
    if (availableQuests.length > 0) {
      setCurrentQuest(availableQuests[0]);
      setStep(0);
      setQuestLog([]);
    }
  };

  const generateAIQuest = async (context = '') => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a new quest scenario for The Naturverse in the ${selectedRegion} region. Previous choices: ${context}. Create a question with 3 interesting choices that teach about nature. Format: Question|Choice1|Choice2|Choice3`,
          userId: user.id,
          language: 'en'
        })
      });
      
      const data = await response.json();
      const questText = data.message || '';
      
      // Parse AI response into quest format
      const parts = questText.split('|');
      if (parts.length >= 4) {
        const newQuest = {
          id: Date.now(),
          question: parts[0].trim(),
          choices: [parts[1].trim(), parts[2].trim(), parts[3].trim()],
          region: selectedRegion,
          isAI: true
        };
        
        setAiQuests(prev => [...prev, newQuest]);
        setCurrentQuest(newQuest);
      }
    } catch (error) {
      console.error('Failed to generate AI quest:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChoice = async (choice, choiceIndex) => {
    const newLogEntry = {
      question: currentQuest.question,
      choice: choice,
      choiceIndex: choiceIndex,
      timestamp: new Date(),
      questId: currentQuest.id
    };
    
    const newLog = [...questLog, newLogEntry];
    setQuestLog(newLog);
    
    // Calculate score based on choice
    const points = Math.floor(Math.random() * 20) + 10; // 10-30 points
    setScore(prev => prev + points);
    
    // Generate next AI quest based on current context
    const context = newLog.map(entry => `${entry.question} -> ${entry.choice}`).join('; ');
    
    if (step < sampleQuests.length - 1) {
      setStep(step + 1);
      setCurrentQuest(sampleQuests[step + 1]);
    } else {
      // Generate AI continuation
      await generateAIQuest(context);
    }
    
    // Notify parent component
    if (onQuestComplete) {
      onQuestComplete({
        questId: currentQuest.id,
        choice: choice,
        choiceIndex: choiceIndex,
        totalScore: score + points,
        questLog: newLog
      });
    }
  };

  const resetQuest = () => {
    setStep(0);
    setQuestLog([]);
    setScore(0);
    setAiQuests([]);
    initializeQuest();
  };

  if (!currentQuest) {
    return (
      <div className='p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg'>
        <h2 className='text-2xl font-bold mb-4 text-green-800'>🧙 AI Quest Engine</h2>
        <p className='text-gray-600'>No quests available for the selected region.</p>
        <button 
          onClick={initializeQuest}
          className='mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600'
        >
          🔄 Reload Quests
        </button>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-green-800'>🧙 AI Quest Engine</h2>
        <div className='flex items-center space-x-4'>
          <div className='bg-yellow-100 px-3 py-1 rounded-full'>
            <span className='text-yellow-800 font-bold'>⭐ {score} pts</span>
          </div>
          <div className='bg-blue-100 px-3 py-1 rounded-full'>
            <span className='text-blue-800 font-bold'>📍 {selectedRegion}</span>
          </div>
        </div>
      </div>

      {/* Current Quest */}
      <div className='bg-white p-4 rounded-lg mb-4 border-l-4 border-green-500'>
        <p className='text-lg mb-4 text-gray-800 font-medium'>
          {currentQuest.question}
        </p>
        
        <div className='space-y-2'>
          {currentQuest.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoice(choice, index)}
              disabled={isGenerating}
              className='block w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50'
            >
              <span className='font-medium'>{String.fromCharCode(65 + index)}.</span> {choice}
            </button>
          ))}
        </div>
        
        {isGenerating && (
          <div className='mt-4 text-center'>
            <span className='text-blue-600 animate-pulse'>🤔 Turian is thinking of the next adventure...</span>
          </div>
        )}
      </div>

      {/* Quest Log */}
      {questLog.length > 0 && (
        <div className='bg-white p-4 rounded-lg mb-4'>
          <h3 className='font-bold text-gray-800 mb-2'>📜 Quest Log</h3>
          <div className='max-h-32 overflow-y-auto'>
            {questLog.map((entry, index) => (
              <div key={index} className='text-sm text-gray-600 mb-1 p-2 bg-gray-50 rounded'>
                <strong>Q{index + 1}:</strong> {entry.question.substring(0, 50)}...
                <br />
                <strong>Choice:</strong> {entry.choice}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className='flex space-x-2'>
        <button
          onClick={() => generateAIQuest(questLog.map(e => e.choice).join(', '))}
          disabled={isGenerating || !user}
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50'
        >
          🎲 Generate New Quest
        </button>
        <button
          onClick={resetQuest}
          className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600'
        >
          🔄 Reset Quest
        </button>
        {questLog.length >= 3 && (
          <button
            onClick={() => onQuestComplete && onQuestComplete({ questLog, score, completed: true })}
            className='bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600'
          >
            ✅ Complete Quest
          </button>
        )}
      </div>
    </div>
  );
}
