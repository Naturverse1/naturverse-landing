
import React, { useState, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Karaoke() {
  const [selectedSong, setSelectedSong] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();

  const songs = [
    { id: 1, title: '🌿 Nature\'s Symphony', artist: 'Turian & Friends', url: '/audio/nature-song.mp3' },
    { id: 2, title: '🦋 Butterfly Dance', artist: 'The Naturverse Band', url: '/audio/butterfly-song.mp3' },
    { id: 3, title: '🌍 Save Our Planet', artist: 'Eco Warriors', url: '/audio/planet-song.mp3' }
  ];

  const startKaraoke = (song) => {
    setSelectedSong(song);
    setScore(Math.floor(Math.random() * 40) + 60); // Mock score 60-100
  };

  return (
    <div className='p-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-purple-800'>🎤 Karaoke Zone</h2>
        <p className='text-purple-600'>Sing along with Turian and earn $NATUR tokens!</p>
      </div>

      {!selectedSong ? (
        <div className='space-y-4'>
          <h3 className='text-xl font-semibold text-purple-700'>Choose Your Song:</h3>
          {songs.map(song => (
            <div key={song.id} className='flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow'>
              <div>
                <h4 className='font-semibold'>{song.title}</h4>
                <p className='text-sm text-gray-600'>{song.artist}</p>
              </div>
              <button
                onClick={() => startKaraoke(song)}
                className='bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors'
              >
                🎵 Sing
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center space-y-4'>
          <div className='bg-white p-4 rounded-lg'>
            <h3 className='text-xl font-bold text-purple-800'>{selectedSong.title}</h3>
            <p className='text-purple-600'>by {selectedSong.artist}</p>
            
            <div className='mt-4'>
              <AudioPlayer
                src={selectedSong.url}
                onPlay={() => setIsRecording(true)}
                onPause={() => setIsRecording(false)}
                className='mx-auto'
              />
            </div>

            {isRecording && (
              <div className='mt-4 animate-pulse'>
                <div className='text-2xl'>🎤 Recording...</div>
                <div className='text-sm text-purple-600'>Keep singing to earn points!</div>
              </div>
            )}

            {score > 0 && (
              <div className='mt-4 p-3 bg-green-100 rounded-lg'>
                <div className='text-2xl font-bold text-green-800'>Score: {score}/100</div>
                <div className='text-sm text-green-600'>You earned {Math.floor(score / 10)} $NATUR tokens!</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedSong('')}
            className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600'
          >
            🔙 Choose Another Song
          </button>
        </div>
      )}
    </div>
  );
}
