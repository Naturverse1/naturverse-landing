
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Vote,
  Clock,
  Sparkles,
  MessageCircle,
  CheckCircle
} from 'lucide-react';

export default function StoryMode({ region = 'Thailandia' }) {
  const { user } = useAuth();
  const [storySession, setStorySession] = useState(null);
  const [storyLog, setStoryLog] = useState([]);
  const [currentPart, setCurrentPart] = useState('');
  const [loading, setLoading] = useState(false);
  const [voteOptions, setVoteOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteDeadline, setVoteDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const speechSynthRef = useRef(null);
  const channelRef = useRef(null);

  // Initialize story session
  useEffect(() => {
    if (!user) return;

    const initSession = async () => {
      try {
        // Find or create story session
        let { data: sessions } = await supabase
          .from('story_sessions')
          .select('*')
          .eq('region', region)
          .eq('status', 'active')
          .limit(1);

        let session = sessions?.[0];

        if (!session) {
          const { data: newSession } = await supabase
            .from('story_sessions')
            .insert({
              region,
              created_by: user.id,
              status: 'active',
              story_history: [],
              current_scene: { scene: 1, description: 'Story beginning' }
            })
            .select()
            .single();
          session = newSession;
        }

        if (session) {
          setStorySession(session);
          setStoryLog(session.story_history || []);
          setSessionActive(true);

          // Join as participant
          await supabase
            .from('story_participants')
            .upsert({
              session_id: session.id,
              user_id: user.id
            });

          // Setup real-time channel
          setupRealtimeChannel(session.id);

          // Start story if empty
          if (!session.story_history?.length) {
            generateStoryPart(session.id, null, true);
          }
        }
      } catch (error) {
        console.error('Error initializing story session:', error);
      }
    };

    initSession();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user, region]);

  // Setup real-time channel
  const setupRealtimeChannel = (sessionId) => {
    const channel = supabase.channel(`story-session-${sessionId}`, {
      config: {
        broadcast: { self: true }
      }
    });

    channel
      .on('broadcast', { event: 'new_story_part' }, ({ payload }) => {
        setCurrentPart(payload.text);
        setVoteOptions(payload.options || []);
        setVotes({});
        setUserVote(null);
        if (payload.deadline) {
          setVoteDeadline(new Date(payload.deadline));
        }
        narrate(payload.text);
      })
      .on('broadcast', { event: 'vote_cast' }, ({ payload }) => {
        setVotes(prev => ({ ...prev, [payload.userId]: payload.choice }));
      })
      .on('broadcast', { event: 'participants_updated' }, ({ payload }) => {
        setParticipants(payload.participants);
      })
      .subscribe();

    channelRef.current = channel;
  };

  // Vote countdown timer
  useEffect(() => {
    if (!voteDeadline) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = voteDeadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(0);
        if (Object.keys(votes).length > 0) {
          tallyVotes();
        }
        clearInterval(timer);
      } else {
        setTimeLeft(Math.ceil(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [voteDeadline, votes]);

  // Generate story part
  const generateStoryPart = async (sessionId, choice = null, isStart = false) => {
    setLoading(true);
    
    try {
      const systemPrompt = `You are Turian, a magical durian turtle 🐢🍃. Narrate an adventurous children's fantasy story set in ${region}. 
      
      Guidelines:
      - Use simple, kid-friendly language
      - Keep each story segment to 2-3 sentences
      - Always end with exactly 3 choices for what to do next
      - Format choices as: "1. [action]", "2. [action]", "3. [action]"
      - Make it educational about nature and culture
      - Use excitement words like "Dee mak!" (very good in Thai)
      
      Previous story context: ${storyLog.map(entry => entry.text).join('\n')}`;

      const userMessage = isStart 
        ? `Start a magical adventure story for children in ${region}! Begin with our young heroes arriving in this beautiful place.`
        : `The group chose: "${choice}". Continue the story with what happens next.`;

      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const storyText = data.response || data.message || 'The adventure continues...';

      // Extract choices from the story
      const choiceMatches = storyText.match(/\d+\.\s*[^.\n]+/g) || [];
      const options = choiceMatches.slice(0, 3);

      // Update story history
      const newEntry = {
        text: storyText,
        choice: choice || 'Story Beginning',
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [...storyLog, newEntry];
      
      await supabase
        .from('story_sessions')
        .update({
          story_history: updatedHistory,
          current_scene: { scene: updatedHistory.length, description: storyText.substring(0, 100) }
        })
        .eq('id', sessionId);

      setStoryLog(updatedHistory);

      // Set vote deadline (30 seconds from now)
      const deadline = new Date(Date.now() + 30000);
      setVoteDeadline(deadline);

      // Broadcast to all participants
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_story_part',
          payload: {
            text: storyText,
            options,
            deadline: deadline.toISOString()
          }
        });
      }

    } catch (error) {
      console.error('Error generating story part:', error);
      setCurrentPart('Something went wrong with the story magic! Let\'s try again...');
    } finally {
      setLoading(false);
    }
  };

  // Cast vote
  const castVote = async (choice) => {
    if (!user || !storySession || userVote) return;

    setUserVote(choice);

    try {
      await supabase
        .from('story_votes')
        .upsert({
          session_id: storySession.id,
          user_id: user.id,
          choice
        });

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'vote_cast',
          payload: { userId: user.id, choice }
        });
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  // Tally votes and continue story
  const tallyVotes = async () => {
    if (!storySession) return;

    try {
      const { data: voteData } = await supabase
        .from('story_votes')
        .select('choice')
        .eq('session_id', storySession.id);

      const voteCounts = {};
      voteData?.forEach(vote => {
        voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
      });

      const winningChoice = Object.entries(voteCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      if (winningChoice) {
        // Clear votes for next round
        await supabase
          .from('story_votes')
          .delete()
          .eq('session_id', storySession.id);

        generateStoryPart(storySession.id, winningChoice);
      }
    } catch (error) {
      console.error('Error tallying votes:', error);
    }
  };

  // Speech synthesis
  const narrate = (text) => {
    if (isMuted || !text) return;

    setIsNarrating(true);
    
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    speechSynthRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && speechSynthRef.current) {
      speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  const restartStory = async () => {
    if (!storySession) return;

    try {
      await supabase
        .from('story_sessions')
        .update({
          story_history: [],
          current_scene: { scene: 1, description: 'Story restart' },
          status: 'active'
        })
        .eq('id', storySession.id);

      await supabase
        .from('story_votes')
        .delete()
        .eq('session_id', storySession.id);

      setStoryLog([]);
      setCurrentPart('');
      setVoteOptions([]);
      setVotes({});
      setUserVote(null);
      setVoteDeadline(null);
      
      generateStoryPart(storySession.id, null, true);
    } catch (error) {
      console.error('Error restarting story:', error);
    }
  };

  if (!sessionActive) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing collaborative story session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <BookOpen className="text-yellow-300" size={32} />
          <div>
            <h1 className="text-2xl font-bold">📚 Live Voting Story Mode</h1>
            <p className="text-purple-100">Collaborative Adventure in {region}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-lg">
            <Users size={16} />
            <span className="text-sm">{Object.keys(votes).length} voters</span>
          </div>
          
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg ${
              isMuted ? 'bg-white/20 text-white/60' : 'bg-white/30 text-white'
            }`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <button
            onClick={restartStory}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg"
          >
            <RotateCcw size={16} />
            <span>New Story</span>
          </button>
        </div>
      </div>

      {/* Current Story Part */}
      {currentPart && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-500 text-white p-2 rounded-full">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="font-semibold text-indigo-800">🧙‍♂️ Turian narrates...</h3>
                {isNarrating && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
              <div className="prose prose-purple max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentPart}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Section */}
      {voteOptions.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Vote className="text-purple-600" size={20} />
              <span>🗳️ Vote for the next action!</span>
            </h3>
            
            {timeLeft > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{timeLeft}s remaining</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {voteOptions.map((option, index) => {
              const voteCount = Object.values(votes).filter(v => v === option).length;
              const isSelected = userVote === option;
              
              return (
                <button
                  key={index}
                  onClick={() => castVote(option)}
                  disabled={!!userVote || timeLeft <= 0}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    <div className="flex items-center space-x-2">
                      {voteCount > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {voteCount} vote{voteCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {isSelected && <CheckCircle className="text-white" size={20} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {userVote && (
            <div className="mt-4 text-center text-sm text-gray-600">
              ✅ Your vote has been cast! Waiting for other adventurers...
            </div>
          )}
        </div>
      )}

      {/* Story Log */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center space-x-2 px-6 py-4 border-b bg-gray-50">
          <MessageCircle size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Adventure Chronicle</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-6 space-y-4">
          {storyLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your epic collaborative adventure story will be recorded here...</p>
          ) : (
            storyLog.map((entry, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600">
                    Chapter {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {entry.choice !== 'Story Beginning' && (
                  <p className="text-sm italic text-gray-600 mb-2">
                    🗳️ Group chose: {entry.choice}
                  </p>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
