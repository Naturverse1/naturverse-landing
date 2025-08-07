
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function TutorBot() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const { user } = useAuth();

  const quickQuestions = [
    'Why is the sky blue?',
    'How do plants make food?',
    'What makes rainbows?',
    'Why do leaves change color?',
    'How do bees make honey?'
  ];

  const askTurian = async (questionText = question) => {
    if (!questionText.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Explain to a child in simple terms: ${questionText}`,
          userId: user?.id,
          chatHistory: chatHistory.slice(-3), // Keep last 3 for context
          language: 'en'
        })
      });

      const data = await res.json();
      const tutorAnswer = data.message || 'I\'m having trouble answering that right now. Try again!';

      setAnswer(tutorAnswer);
      
      // Add to chat history
      const newEntry = { question: questionText, answer: tutorAnswer, timestamp: new Date() };
      setChatHistory(prev => [...prev, newEntry].slice(-10)); // Keep last 10 entries

      setQuestion('');
    } catch (error) {
      setAnswer('Sorry, I\'m having trouble connecting right now. Please try again!');
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAsking) {
      askTurian();
    }
  };

  return (
    <div className='p-6 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-blue-800'>🎓 Ask Turian Anything!</h2>
        <p className='text-blue-600'>Your friendly AI tutor is here to help you learn!</p>
      </div>

      {/* Quick Questions */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3'>💡 Popular Questions:</h3>
        <div className='flex flex-wrap gap-2'>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => askTurian(q)}
              className='bg-white text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-50 border border-blue-200 transition-colors'
              disabled={isAsking}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input */}
      <div className='space-y-4'>
        <div className='flex space-x-2'>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask me anything about nature, science, or learning...'
            className='flex-1 p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            disabled={isAsking}
          />
          <button
            onClick={() => askTurian()}
            disabled={isAsking || !question.trim()}
            className='bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
          >
            {isAsking ? '🤔' : '🚀'}
          </button>
        </div>

        {/* Current Answer */}
        {answer && (
          <div className='bg-white p-4 rounded-lg border border-green-200'>
            <div className='flex items-start space-x-3'>
              <div className='text-2xl'>🐢</div>
              <div className='flex-1'>
                <h4 className='font-semibold text-green-800 mb-2'>Turian says:</h4>
                <div className='text-gray-700 leading-relaxed'>{answer}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className='mt-6'>
            <h3 className='text-lg font-semibold text-gray-700 mb-3'>📚 Recent Questions:</h3>
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {chatHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className='bg-white p-3 rounded-lg border border-gray-200'>
                  <div className='text-sm font-medium text-gray-800 mb-1'>
                    Q: {entry.question}
                  </div>
                  <div className='text-sm text-gray-600 line-clamp-2'>
                    A: {entry.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAsking && (
        <div className='text-center mt-4'>
          <div className='animate-spin text-2xl'>🌿</div>
          <p className='text-blue-600 mt-2'>Turian is thinking...</p>
        </div>
      )}
    </div>
  );
}
