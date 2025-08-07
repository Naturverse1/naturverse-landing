
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Users, 
  Sparkles,
  MessageCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export default function CoOpNarrator({ lobbyId, isActive, onQuestComplete }) {
  const { user } = useAuth();
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentStory, setCurrentStory] = useState('');
  const [storyHistory, setStoryHistory] = useState([]);
  const [playerActions, setPlayerActions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [questData, setQuestData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef(null);
  const speechSynthRef = useRef(null);

  useEffect(() => {
    if (isActive && lobbyId) {
      loadQuestData();
      subscribeToLobbyUpdates();
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive, lobbyId]);

  async function loadQuestData() {
    try {
      const { data: lobby, error } = await supabase
        .from('multiplayer_lobbies')
        .select(`
          *,
          lobby_participants(
            user_id,
            profiles(email, full_name)
          )
        `)
        .eq('id', lobbyId)
        .single();

      if (error) throw error;

      setParticipants(lobby.lobby_participants || []);
      
      // Generate initial quest setup
      await generateQuestIntro(lobby);
    } catch (error) {
      console.error('Error loading quest data:', error);
    }
  }

  function subscribeToLobbyUpdates() {
    const channel = supabase
      .channel(`lobby-${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants'
        },
        () => {
          loadQuestData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        handlePlayerAction(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }

  async function generateQuestIntro(lobby) {
    setLoading(true);
    
    const playerNames = lobby.lobby_participants.map(p => 
      p.profiles?.full_name || p.profiles?.email || 'Adventurer'
    );

    const introPrompt = `
    You are Turian, the AI narrator for a magical co-op adventure in the Naturverse. 
    Create an engaging quest introduction for ${playerNames.length} players: ${playerNames.join(', ')}.
    
    The quest should be set in ${lobby.region || 'Thailandia'} and involve environmental education themes.
    Make it exciting, collaborative, and suitable for all ages.
    
    Introduce the players as heroes who must work together to solve an environmental challenge.
    End with a choice or challenge that requires team cooperation.
    
    Keep it under 200 words and speak directly to the players.
    `;

    try {
      // In a real implementation, this would call OpenAI API
      const narrativeText = `Welcome, brave adventurers ${playerNames.join(' and ')}! 

I am Turian, your guide through the mystical Naturverse. You find yourselves standing at the edge of the Enchanted Mangrove Forest in ${lobby.region || 'Thailandia'}, where the ancient Tree of Harmony has begun to wither.

The local wildlife speaks of dark pollution spreading through their sacred waters, threatening the delicate ecosystem that has thrived for centuries. As chosen guardians of nature, you must work together to discover the source of this corruption and restore balance to the forest.

Your quest begins now! You notice three paths ahead:
🌊 The Crystal Stream Path - leading to the water sources
🦋 The Butterfly Sanctuary Trail - where creatures seek refuge  
🌳 The Ancient Grove Route - toward the heart of the forest

What do you choose, adventurers? Speak your decision together, and let your journey begin!`;

      setCurrentStory(narrativeText);
      setStoryHistory([{ type: 'narration', text: narrativeText, timestamp: new Date() }]);
      
      if (!isMuted) {
        speakText(narrativeText);
      }

      setQuestData({
        title: 'The Withering Grove',
        theme: 'Environmental Protection',
        difficulty: 'Collaborative',
        region: lobby.region || 'Thailandia'
      });

    } catch (error) {
      console.error('Error generating quest intro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayerAction(action) {
    const newAction = {
      player: user.email,
      action: action.trim(),
      timestamp: new Date()
    };

    setPlayerActions(prev => [...prev, newAction]);
    setStoryHistory(prev => [...prev, { type: 'action', ...newAction }]);

    // Generate AI response based on player action
    await generateNarrativeResponse(action);
  }

  async function generateNarrativeResponse(playerAction) {
    setLoading(true);

    const context = storyHistory.slice(-3).map(entry => 
      entry.type === 'narration' ? `Narrator: ${entry.text}` : `${entry.player}: ${entry.action}`
    ).join('\n');

    const responsePrompt = `
    Continue the Naturverse adventure story based on this player action: "${playerAction}"
    
    Previous context:
    ${context}
    
    As Turian the AI narrator, respond with:
    1. Acknowledge the player's choice
    2. Describe what happens next in the environmental adventure
    3. Present a new challenge or discovery that requires teamwork
    4. Keep it engaging and educational about nature/environment
    
    Limit response to 100 words and maintain an encouraging, mystical tone.
    `;

    try {
      // In a real implementation, this would call OpenAI API
      const responses = [
        `Excellent choice! As you venture down the chosen path, you discover glowing mushrooms that pulse with an eerie light. These bioluminescent fungi seem to be absorbing the pollution, but they're struggling! You hear a gentle voice whisper: "Help us cleanse the waters, brave ones. We need the power of teamwork to filter the toxins." What will you do together?`,
        
        `Wise decision, adventurers! Your combined efforts reveal a hidden grove where baby animals huddle together, afraid of the spreading darkness. An ancient owl perches nearby and speaks: "The corruption grows stronger, but your unity gives us hope. Find the source and work as one - only together can you heal our home." How will you proceed?`,
        
        `Your teamwork shines bright! Following the path together, you discover magical crystals that once purified the forest waters. But they've grown dim with pollution. A friendly river spirit appears: "Brave guardians, these crystals need your collective energy to shine again. Each of you must contribute something precious to restore their power." What will each adventurer offer?`
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setCurrentStory(response);
      setStoryHistory(prev => [...prev, { type: 'narration', text: response, timestamp: new Date() }]);
      
      if (!isMuted) {
        speakText(response);
      }

    } catch (error) {
      console.error('Error generating narrative response:', error);
    } finally {
      setLoading(false);
    }
  }

  function speakText(text) {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Natural')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);

      utterance.onend = () => {
        setIsNarrating(false);
      };
    }
  }

  function toggleListening() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  }

  function restartQuest() {
    setCurrentStory('');
    setStoryHistory([]);
    setPlayerActions([]);
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    loadQuestData();
  }

  if (!isActive) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">Start a quest from the lobby to begin your adventure!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <Sparkles className="text-yellow-300" size={24} />
          <div>
            <h2 className="text-xl font-bold">🧙‍♂️ Turian's Co-Op Quest</h2>
            {questData && (
              <p className="text-purple-100 text-sm">{questData.title} • {questData.region}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">
            {participants.length} adventurers
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 bg-white p-4 rounded-lg border">
        <button
          onClick={toggleListening}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          <span>{isListening ? 'Stop Listening' : 'Speak Action'}</span>
        </button>

        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg ${
            isMuted ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white'
          }`}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          onClick={restartQuest}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <RotateCcw size={16} />
          <span>New Quest</span>
        </button>
      </div>

      {/* Current Story */}
      {currentStory && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-500 text-white p-2 rounded-full">
              <BookOpen size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-indigo-800">🧙‍♂️ Turian narrates...</h3>
                {isNarrating && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">{currentStory}</p>
            </div>
          </div>
        </div>
      )}

      {/* Adventure Log */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center space-x-2 px-4 py-3 border-b bg-gray-50">
          <MessageCircle size={16} className="text-gray-600" />
          <h3 className="font-medium text-gray-800">Adventure Log</h3>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
          {storyHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your adventure story will appear here...</p>
          ) : (
            storyHistory.map((entry, index) => (
              <div key={index} className={`flex items-start space-x-3 ${
                entry.type === 'narration' ? 'bg-purple-50' : 'bg-green-50'
              } p-3 rounded-lg`}>
                {entry.type === 'narration' ? (
                  <BookOpen size={16} className="text-purple-600 mt-0.5" />
                ) : (
                  <Users size={16} className="text-green-600 mt-0.5" />
                )}
                <div className="flex-1">
                  {entry.type === 'action' && (
                    <p className="text-sm font-medium text-gray-800 mb-1">{entry.player}:</p>
                  )}
                  <p className="text-gray-700 text-sm">{entry.text || entry.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
          <Users size={16} />
          <span>Quest Participants</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {participant.profiles?.full_name || participant.profiles?.email || 'Adventurer'}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Turian is thinking...</p>
        </div>
      )}
    </div>
  );
}
