
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const tracks = [
  { id: 'storytelling', label: '📖 Storytelling', description: 'Create and share magical stories' },
  { id: 'nature', label: '🌱 Nature', description: 'Explore ecosystems and wildlife' },
  { id: 'music', label: '🎵 Music', description: 'Learn rhythms and melodies' },
  { id: 'math', label: '🔢 Math', description: 'Numbers and problem solving' },
  { id: 'language', label: '🗣️ Language', description: 'Communication and vocabulary' },
  { id: 'movement', label: '🏃 Movement', description: 'Physical activities and coordination' }
];

const LearningTrack = () => {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('users')
          .select('learning_track')
          .eq('id', user.id)
          .single();
        
        if (data?.learning_track) {
          setSelectedTrack(data.learning_track);
        }
      } catch (error) {
        console.error('Error fetching learning track:', error);
      }
    };
    
    fetchTrack();
  }, [user]);

  const selectTrack = async (trackId) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ learning_track: trackId })
        .eq('id', user.id);
      
      if (!error) {
        setSelectedTrack(trackId);
      }
    } catch (error) {
      console.error('Error updating learning track:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to choose your learning track.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          🎓 Naturversity Learning Tracks
        </h1>
        <p className="text-gray-600">
          Choose your personalized learning journey with Turian!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map(track => (
          <div
            key={track.id}
            className={`relative p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer ${
              selectedTrack === track.id 
                ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white transform scale-105' 
                : 'bg-white hover:shadow-xl hover:scale-102'
            }`}
            onClick={() => selectTrack(track.id)}
          >
            {selectedTrack === track.id && (
              <div className="absolute top-2 right-2">
                <div className="bg-white text-green-600 rounded-full p-1">
                  ✓
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-4xl mb-3">
                {track.label.split(' ')[0]}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {track.label.split(' ').slice(1).join(' ')}
              </h3>
              <p className={`text-sm ${
                selectedTrack === track.id ? 'text-white/90' : 'text-gray-600'
              }`}>
                {track.description}
              </p>
            </div>
            
            {loading && selectedTrack === track.id && (
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTrack && (
        <div className="mt-8 text-center bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-purple-800 mb-2">
            🎯 Your Learning Path
          </h2>
          <p className="text-lg text-gray-700">
            You've chosen: <strong>{tracks.find(t => t.id === selectedTrack)?.label}</strong>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            🧙‍♂️ Turian is preparing personalized quests and activities just for you!
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningTrack;
