
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Clock, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';

const activities = [
  { 
    name: '🧘 Mindful Breathing', 
    duration: 5, 
    type: 'meditation',
    description: 'Deep breathing exercise to calm your mind',
    instructions: 'Breathe in slowly for 4 counts, hold for 4, breathe out for 4'
  },
  { 
    name: '🤸 Jumping Jacks', 
    duration: 3, 
    type: 'exercise',
    description: 'Fun cardio exercise to get your heart pumping',
    instructions: 'Jump with feet apart while raising arms, then jump back to starting position'
  },
  { 
    name: '🧘‍♀️ Nature Meditation', 
    duration: 4, 
    type: 'meditation',
    description: 'Connect with nature through guided visualization',
    instructions: 'Close your eyes and imagine yourself in a peaceful forest'
  },
  { 
    name: '🏃 Running in Place', 
    duration: 2, 
    type: 'exercise',
    description: 'Build stamina with this simple cardio exercise',
    instructions: 'Lift your knees high and pump your arms while running in place'
  },
  { 
    name: '🦋 Butterfly Pose', 
    duration: 3, 
    type: 'yoga',
    description: 'Gentle hip opening stretch',
    instructions: 'Sit with soles of feet together, gently flap your knees like butterfly wings'
  },
  { 
    name: '🌟 Gratitude Practice', 
    duration: 2, 
    type: 'mindfulness',
    description: 'Practice thankfulness for a positive mindset',
    instructions: 'Think of 3 things you are grateful for today'
  }
];

const NatureFit = () => {
  const [current, setCurrent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isGuest) {
      loadUserProgress();
    }
  }, [user]);

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && current) {
      completeActivity();
    }
  }, [timeLeft, isPaused, current]);

  const loadUserProgress = async () => {
    try {
      const { data } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('created_by', user.id)
        .eq('content_type', 'exercise')
        .order('created_at', { ascending: false });

      if (data) {
        const completedToday = data.filter(d => 
          new Date(d.created_at).toDateString() === new Date().toDateString()
        );
        setCompleted(completedToday.map(d => d.title));
        setTotalMinutes(data.length * 3); // Rough estimate
        
        // Calculate streak (consecutive days with at least one activity)
        let currentStreak = 0;
        let checkDate = new Date();
        while (true) {
          const dayActivities = data.filter(d => 
            new Date(d.created_at).toDateString() === checkDate.toDateString()
          );
          if (dayActivities.length === 0) break;
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        setStreak(currentStreak);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const startActivity = (activity) => {
    setCurrent(activity);
    setTimeLeft(activity.duration * 60);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    if (current) {
      setTimeLeft(current.duration * 60);
      setIsPaused(false);
    }
  };

  const completeActivity = async () => {
    if (!current) return;

    setLoading(true);
    try {
      // Log the activity
      await supabase.from('learning_modules').insert({
        title: current.name,
        description: `NatureFit™ wellness session: ${current.description}`,
        content_type: 'exercise',
        region: 'Lotus Lake',
        age_group: '6-12',
        created_by: user?.id,
        module_data: {
          activity_type: current.type,
          duration_minutes: current.duration,
          completed_at: new Date().toISOString()
        }
      });

      // Update local state
      setCompleted(prev => [...prev, current.name]);
      setTotalMinutes(prev => prev + current.duration);
      
      // Check for streak update
      if (completed.length === 0) {
        setStreak(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setLoading(false);
      setCurrent(null);
      setTimeLeft(0);
    }
  };

  const stopActivity = () => {
    setCurrent(null);
    setTimeLeft(0);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      meditation: 'bg-purple-500',
      exercise: 'bg-green-500', 
      yoga: 'bg-blue-500',
      mindfulness: 'bg-pink-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            🌿 NatureFit™
          </h1>
          <p className="text-xl text-green-600 mb-4">Mind + Body Wellness Zone</p>
          <p className="text-gray-600">Move your body, calm your mind, connect with nature</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Today's Sessions</h3>
            <p className="text-3xl font-bold text-red-500">{completed.length}</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Total Minutes</h3>
            <p className="text-3xl font-bold text-blue-500">{totalMinutes}</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Daily Streak</h3>
            <p className="text-3xl font-bold text-green-500">{streak}</p>
          </div>
        </div>

        {/* Current Activity Timer */}
        {current && (
          <div className="bg-white rounded-lg p-8 shadow-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{current.name}</h2>
            <p className="text-gray-600 mb-4">{current.description}</p>
            
            <div className="text-6xl font-bold text-green-600 mb-4">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={togglePause}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isPaused 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {isPaused ? <Play className="mr-2" size={20} /> : <Pause className="mr-2" size={20} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                <RotateCcw className="mr-2" size={20} />
                Reset
              </button>
              
              <button
                onClick={stopActivity}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Stop
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Instructions:</h4>
              <p className="text-green-700 text-sm">{current.instructions}</p>
            </div>
          </div>
        )}

        {/* Activity Selection */}
        {!current && (
          <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Choose Your Wellness Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getActivityTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{activity.duration} min</span>
                    <button
                      onClick={() => startActivity(activity)}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Completed Activities */}
        {completed.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="mr-2 text-green-500" />
              Today's Completed Sessions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {completed.map((activityName, index) => (
                <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  <span className="text-green-800 text-sm">{activityName}</span>
                </div>
              ))}
            </div>
            {completed.length >= 3 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-yellow-800 font-semibold">
                  🏆 Amazing! You've completed {completed.length} wellness sessions today!
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Turian is so proud of your dedication to health and mindfulness! 🍃
                </p>
              </div>
            )}
          </div>
        )}

        {/* Motivational Message */}
        <div className="mt-8 text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
          <p className="text-lg text-gray-700 italic">
            "A healthy body and peaceful mind are the foundation of all learning and growth." 
          </p>
          <p className="text-sm text-gray-500 mt-2">- Turian the Wise 🐢🍃</p>
        </div>
      </div>
    </div>
  );
};

export default NatureFit;
