
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AILessonBuilder() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('Thailandia');
  const [ageGroup, setAgeGroup] = useState('6-10');

  async function generateLesson() {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/ai-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          region, 
          ageGroup,
          language: 'en' 
        })
      });
      
      if (!res.ok) throw new Error('Failed to generate lesson');
      
      const data = await res.json();
      setLesson(data);
      
      // Save to Supabase
      await supabase.from('learning_modules').insert([{
        title: data.title,
        description: data.summary,
        content_type: 'storybook',
        region: region,
        age_group: ageGroup,
        media_urls: JSON.stringify(data.assets || []),
        content: data.content,
        difficulty: data.difficulty || 'medium',
        duration: data.duration || 15
      }]);
      
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-6 text-center text-nature-green'>
        🧠 AI Lesson Builder
      </h2>
      
      <div className='space-y-4 mb-6'>
        <div>
          <label className='block text-sm font-medium mb-2'>Lesson Topic</label>
          <input 
            className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-nature-green focus:border-transparent' 
            placeholder='Enter topic (e.g., "Rainforest Animals", "Solar System")' 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Region</label>
            <select 
              className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-nature-green'
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="Thailandia">🇹🇭 Thailandia</option>
              <option value="Chinadia">🇨🇳 Chinadia</option>
              <option value="Bharatia">🇮🇳 Bharatia</option>
              <option value="Australis">🇦🇺 Australis</option>
              <option value="Americana">🇺🇸 Americana</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-2'>Age Group</label>
            <select 
              className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-nature-green'
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="4-6">4-6 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10-14">10-14 years</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={generateLesson}
          disabled={loading || !topic.trim()}
          className='w-full bg-nature-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {loading ? '🔄 Generating Lesson...' : '✨ Generate AI Lesson'}
        </button>
      </div>

      {lesson && (
        <div className='bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-l-4 border-nature-green'>
          <h3 className='text-xl font-bold mb-3 text-gray-800'>{lesson.title}</h3>
          <p className='text-gray-600 mb-4'>{lesson.summary}</p>
          
          {lesson.content && (
            <div className='space-y-3'>
              <h4 className='font-semibold text-gray-800'>Lesson Content:</h4>
              <div className='bg-white p-4 rounded-lg border'>
                <pre className='whitespace-pre-wrap text-sm text-gray-700'>{lesson.content}</pre>
              </div>
            </div>
          )}
          
          {lesson.activities && (
            <div className='mt-4'>
              <h4 className='font-semibold text-gray-800 mb-2'>Learning Activities:</h4>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                {lesson.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className='mt-4 flex items-center gap-4 text-sm text-gray-600'>
            <span>📍 Region: {region}</span>
            <span>👥 Age: {ageGroup}</span>
            <span>⏱️ Duration: {lesson.duration || 15} min</span>
            <span>📊 Difficulty: {lesson.difficulty || 'Medium'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
