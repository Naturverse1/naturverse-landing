
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Pause, Square, Mic, MicOff, Music, Volume2, VolumeX, Download, Save } from 'lucide-react';

const defaultBeats = [
  { 
    name: "🌴 Jungle Beat", 
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_d9a9d65b69.mp3",
    genre: "Nature",
    tempo: "Medium"
  },
  { 
    name: "💦 Lotus Flow", 
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_5e5b29a4c7.mp3",
    genre: "Ambient",
    tempo: "Slow"
  },
  { 
    name: "🐸 Froggy Funk", 
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_7d38d26e65.mp3",
    genre: "Funk",
    tempo: "Fast"
  },
  {
    name: "🦋 Butterfly Waltz",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_0f0b9e0e0f.mp3",
    genre: "Classical",
    tempo: "Medium"
  },
  {
    name: "🌊 Ocean Waves",
    url: "https://cdn.pixabay.com/audio/2022/08/04/audio_1b2c3d4e5f.mp3",
    genre: "Nature",
    tempo: "Slow"
  },
  {
    name: "🎪 Circus Fun",
    url: "https://cdn.pixabay.com/audio/2022/02/11/audio_6g7h8i9j0k.mp3",
    genre: "Playful",
    tempo: "Fast"
  }
];

const MusicZone = () => {
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [songName, setSongName] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [loading, setLoading] = useState(false);
  const [savedSongs, setSavedSongs] = useState([]);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const chunksRef = useRef([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isGuest) {
      loadSavedSongs();
    }
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const loadSavedSongs = async () => {
    try {
      const { data } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('created_by', user.id)
        .eq('content_type', 'music')
        .order('created_at', { ascending: false });
      
      setSavedSongs(data || []);
    } catch (error) {
      console.error('Error loading saved songs:', error);
    }
  };

  const playBeat = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopBeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to free up microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTime - 1) {
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    setRecording(false);
  };

  const saveSong = async () => {
    if (!audioUrl || !songName.trim()) {
      alert('Please name your song and make sure you have recorded something!');
      return;
    }

    setLoading(true);
    try {
      // Convert blob URL back to blob for upload
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      const filePath = `songs/${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: "audio/webm",
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.from('learning_modules').insert({
        title: songName.trim(),
        description: `MusicZone™ Recording${selectedBeat ? ` with ${selectedBeat.name}` : ''}`,
        content_type: 'music',
        region: 'Royal Canopy',
        age_group: '6-12',
        created_by: user.id,
        module_data: {
          audio_url: publicUrl,
          backing_track: selectedBeat?.name || null,
          duration: recordingTime,
          created_in_musiczone: true
        }
      });

      alert('🎶 Song saved to your profile!');
      setSongName('');
      setAudioUrl(null);
      setRecordingTime(0);
      loadSavedSongs();
      
    } catch (error) {
      console.error('Error saving song:', error);
      alert('Failed to save song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadRecording = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${songName || 'my-song'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🎤 MusicZone™
          </h1>
          <p className="text-xl text-purple-600 mb-4">Create, Record & Share Your Music</p>
          <p className="text-gray-600">Compose, record, and sing with Turian & The Ribbits!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Beat Selection & Controls */}
          <div className="space-y-6">
            {/* Beat Selection */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Music className="mr-2" />
                Choose Your Beat
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {defaultBeats.map((beat, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedBeat(beat);
                      setIsPlaying(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedBeat?.name === beat.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{beat.name}</h3>
                        <p className="text-sm text-gray-600">
                          {beat.genre} • {beat.tempo} Tempo
                        </p>
                      </div>
                      {selectedBeat?.name === beat.name && (
                        <div className="text-purple-500">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Controls */}
            {selectedBeat && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Now Selected: {selectedBeat.name}
                </h3>
                
                <audio
                  ref={audioRef}
                  src={selectedBeat.url}
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={playBeat}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <button
                      onClick={stopBeat}
                      className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                    >
                      <Square size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-gray-600 hover:text-purple-600"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recording & Song Management */}
          <div className="space-y-6">
            {/* Recording Section */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Mic className="mr-2" />
                Record Your Voice
              </h2>
              
              <input
                type="text"
                placeholder="🎶 Name your song"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                maxLength={50}
              />

              <div className="text-center">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center mx-auto"
                  >
                    <Mic className="mr-2" size={20} />
                    Start Recording ({maxRecordingTime}s max)
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-red-500 font-bold text-lg animate-pulse">
                      ⏺ Recording... {formatTime(recordingTime)}
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center mx-auto"
                    >
                      <MicOff className="mr-2" size={20} />
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Playback Section */}
            {audioUrl && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🔁 Your Recording</h3>
                <audio controls src={audioUrl} className="w-full mb-4" />
                
                <div className="flex space-x-3">
                  <button
                    onClick={saveSong}
                    disabled={loading || !songName.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    <Save className="mr-2" size={16} />
                    {loading ? 'Saving...' : 'Save Song'}
                  </button>
                  
                  <button
                    onClick={downloadRecording}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center"
                  >
                    <Download className="mr-2" size={16} />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Saved Songs */}
            {savedSongs.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎵 Your Saved Songs</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {savedSongs.map((song, index) => (
                    <div key={song.id} className="border rounded-lg p-3">
                      <h4 className="font-semibold text-gray-800">{song.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Created: {new Date(song.created_at).toLocaleDateString()}
                      </p>
                      {song.module_data?.audio_url && (
                        <audio controls src={song.module_data.audio_url} className="w-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-purple-800 mb-2">🎤 Recording Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
            <div>
              <strong>🎵 Choose a beat</strong> that matches your song's mood
            </div>
            <div>
              <strong>🎙️ Speak clearly</strong> and stay close to your microphone
            </div>
            <div>
              <strong>🌟 Have fun!</strong> Let your creativity flow with Turian
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            "Music is the universal language of nature!" - Turian the Wise 🐢🎶
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicZone;
