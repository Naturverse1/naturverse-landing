
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
  MessageCircle
} from 'lucide-react';

export default function StoryMode({ region = 'Thailandia' }) {
  const { user } = useAuth();
  const [storySession, setStorySession] = useState(null);
  const [storyLog, setStoryLog] = useState([]);
  const [currentPart, setCurrentPart] = useState('');
  const [loading, setLoading] = useState(false);
  const [voteOptions, setVoteOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [votes, setVotes] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const speechSynthRef = useRef(null);

  useEffect(() => {
    initializeStorySession();
    
    // Set up real-time subscriptions
    const storyChannel = supabase
      .channel('story-session')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_sessions'
        },
        handleStoryUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_votes'
        },
        handleVoteUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storyChannel);
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [region]);

  async function initializeStorySession() {
    try {
      // Check for active story session in this region
      let { data: session, error } = await supabase
        .from('story_sessions')
        .select(`
          *,
          story_participants(
            user_id,
            profiles(email, full_name)
          )
        `)
        .eq('region', region)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!session) {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('story_sessions')
          .insert({
            region,
            title: `Adventure in ${region}`,
            created_by: user.id,
            current_scene: { scene: 1, description: 'Beginning of adventure' }
          })
          .select()
          .single();

        if (createError) throw createError;
        session = newSession;

        // Add creator as participant
        await supabase
          .from('story_participants')
          .insert({
            session_id: session.id,
            user_id: user.id
          });
      } else {
        // Join existing session
        const { error: joinError } = await supabase
          .from('story_participants')
          .upsert({
            session_id: session.id,
            user_id: user.id
          }, {
            onConflict: 'session_id,user_id'
          });

        if (joinError && joinError.code !== '23505') {
          console.error('Error joining session:', joinError);
        }
      }

      setStorySession(session);
      setSessionActive(true);
      loadStoryHistory(session.id);
      loadParticipants(session.id);

      // Start story if it's a new session
      if (!session.story_history || session.story_history.length === 0) {
        generateStoryPart(session.id, null, true);
      }

    } catch (error) {
      console.error('Error initializing story session:', error);
    }
  }

  async function loadStoryHistory(sessionId) {
    try {
      const { data, error } = await supabase
        .from('story_sessions')
        .select('story_history, current_scene')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      const history = data.story_history || [];
      setStoryLog(history);
      
      if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        setCurrentPart(lastEntry.text);
        
        // Extract voting options from the last story part
        if (lastEntry.text) {
          const options = extractVotingOptions(lastEntry.text);
          setVoteOptions(options);
        }
      }
    } catch (error) {
      console.error('Error loading story history:', error);
    }
  }

  async function loadParticipants(sessionId) {
    try {
      const { data, error } = await supabase
        .from('story_participants')
        .select(`
          user_id,
          joined_at,
          profiles(email, full_name)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  }

  function extractVotingOptions(text) {
    const patterns = [
      /(?:^|\n)\s*[1-3][\.\)]\s*([^\n]+)/g,
      /(?:^|\n)\s*[ABC][\.\)]\s*([^\n]+)/g,
      /(?:^|\n)\s*(?:Option|Choice)\s*[1-3]:\s*([^\n]+)/gi
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length >= 2) {
        return matches.map(match => match[1].trim()).slice(0, 3);
      }
    }

    return [];
  }

  async function generateStoryPart(sessionId, choice = null, isStart = false) {
    setLoading(true);
    
    try {
      const systemPrompt = `
You are Turian, the magical AI narrator for group adventures in the Naturverse. 
Create an engaging story segment set in ${region} for multiple players working together.

Guidelines:
- Use vivid, kid-friendly language suitable for all ages
- Include environmental education themes related to ${region}
- Create collaborative challenges that require teamwork
- Always end with exactly 3 numbered choices for the group to vote on
- Keep each segment to 150-200 words
- Make it exciting and interactive

Previous story context: ${storyLog.map(entry => entry.text).join('\n\n')}
${choice ? `Group voted for: ${choice}` : ''}
`;

      const prompt = isStart 
        ? `Start an exciting adventure story where our heroes arrive in ${region} and discover something magical that needs their help. End with 3 choices for what they should do first.`
        : `Continue the adventure based on the group's choice: "${choice}". Create the next exciting chapter and end with 3 new choices.`;

      // In a real implementation, this would call OpenAI API
      // For now, we'll generate story responses based on common adventure patterns
      const storyResponses = {
        start: `🌟 Welcome, brave adventurers, to the mystical realm of ${region}! 

As you step through the shimmering portal, you find yourselves in an enchanted forest where ancient trees whisper secrets of old. The air sparkles with magical energy, and colorful creatures peek at you from behind glowing mushrooms.

Suddenly, a wise old elephant approaches, his eyes filled with worry. "Young heroes," he trumpets softly, "our sacred Crystal Springs are losing their magic! The forest creatures are falling ill, and our home is in great danger. We need brave souls like you to help us discover what's causing this terrible curse."

The elephant's trunk points to three different paths through the mystical forest:

1. Follow the Rainbow Bridge to the Floating Gardens above the clouds
2. Dive into the Underwater Temple beneath the Crystal Springs  
3. Climb the Ancient Tree of Wisdom to seek counsel from the Sky Spirits

What path will your group choose to begin this magical quest?`,
        
        continued: generateAdventureResponse(choice, region)
      };

      const response = isStart ? storyResponses.start : storyResponses.continued;
      
      const newEntry = {
        text: response,
        choice: choice || 'Story Beginning',
        timestamp: new Date().toISOString(),
        narrator: 'Turian'
      };

      const updatedHistory = [...storyLog, newEntry];
      
      // Update story session in database
      await supabase
        .from('story_sessions')
        .update({
          story_history: updatedHistory,
          current_scene: {
            scene: updatedHistory.length,
            description: choice || 'Adventure begins'
          }
        })
        .eq('id', sessionId);

      setStoryLog(updatedHistory);
      setCurrentPart(response);
      
      const options = extractVotingOptions(response);
      setVoteOptions(options);
      setVotes({}); // Reset votes for new options

      // Clear any pending votes
      await supabase
        .from('story_votes')
        .delete()
        .eq('session_id', sessionId);

      if (!isMuted) {
        speakText(response);
      }

    } catch (error) {
      console.error('Error generating story part:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateAdventureResponse(choice, region) {
    const responses = [
      `🌈 Your group decides to cross the Rainbow Bridge! As you step onto the colorful pathway, it rises high into the clouds. Below you see the entire ${region} spreading out like a magical carpet. At the Floating Gardens, you discover crystal flowers that hum with ancient melodies. A friendly cloud dragon appears and reveals that dark pollution from the lower world is poisoning the sky realm. "Help us cleanse the storm clouds," she pleads, "before the poison reaches our sacred gardens!" 

Your next choices:
1. Use the singing flowers to create a purification song
2. Ride the cloud dragon to find the source of pollution
3. Gather rainbow dewdrops to make a healing potion`,

      `🌊 Diving into the Crystal Springs, you discover an underwater kingdom of glowing coral and friendly sea creatures! But something's wrong - the magical crystals that power this realm are turning dark. A wise sea turtle swims up to you, her shell covered in ancient symbols. "Young guardians," she says, "an evil shadow has invaded our deepest caves. It feeds on magic and grows stronger each day. We need your combined courage to face this darkness!"

What will your group do:
1. Follow the turtle to the Shadow Caves for a direct confrontation
2. Seek help from the Electric Eels to power up your magic
3. Collect glowing pearls to create a light barrier`,

      `🌳 Climbing the Ancient Tree of Wisdom, your group reaches a magical treehouse where the Sky Spirits dwell. These ethereal beings glow with soft light and speak in harmonious whispers. "Seekers of truth," they say, "we have watched the balance of ${region} shift toward darkness. Three trials await those brave enough to restore harmony: the Trial of Courage, the Trial of Wisdom, and the Trial of Heart. Only by working together can you succeed!"

Choose your first trial:
1. The Trial of Courage - face your greatest fears in the Mist Maze
2. The Trial of Wisdom - solve ancient riddles in the Library of Stars  
3. The Trial of Heart - heal wounded forest creatures with pure compassion`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  function speakText(text) {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Natural') || voice.lang.includes('en')
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

  async function submitVote(optionIndex, optionText) {
    if (!storySession || !user) return;

    try {
      await supabase
        .from('story_votes')
        .upsert({
          session_id: storySession.id,
          user_id: user.id,
          vote_option: optionIndex,
          vote_text: optionText
        }, {
          onConflict: 'session_id,user_id'
        });

      setSelectedOption(optionText);
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }

  async function handleStoryUpdate(payload) {
    if (payload.new && payload.new.id === storySession?.id) {
      loadStoryHistory(payload.new.id);
    }
  }

  async function handleVoteUpdate() {
    if (!storySession) return;
    
    try {
      const { data, error } = await supabase
        .from('story_votes')
        .select('vote_option, vote_text, user_id')
        .eq('session_id', storySession.id);

      if (error) throw error;

      const voteCount = {};
      data.forEach(vote => {
        voteCount[vote.vote_text] = (voteCount[vote.vote_text] || 0) + 1;
      });

      setVotes(voteCount);

      // Check if all participants have voted
      if (data.length === participants.length && data.length > 0) {
        // Find the winning option
        const winner = Object.entries(voteCount).reduce((a, b) => 
          voteCount[a[0]] > voteCount[b[0]] ? a : b
        );
        
        setTimeout(() => {
          generateStoryPart(storySession.id, winner[0]);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  }

  async function restartStory() {
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

      // Clear votes
      await supabase
        .from('story_votes')
        .delete()
        .eq('session_id', storySession.id);

      setStoryLog([]);
      setCurrentPart('');
      setVoteOptions([]);
      setVotes({});
      setSelectedOption('');
      
      generateStoryPart(storySession.id, null, true);
    } catch (error) {
      console.error('Error restarting story:', error);
    }
  }

  if (!sessionActive) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing story session...</p>
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
            <h1 className="text-2xl font-bold">📚 AI-Narrated Group Story</h1>
            <p className="text-purple-100">Adventure in {region}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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

      {/* Participants */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          <Users size={18} />
          <span>Story Participants ({participants.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant, index) => (
            <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {participant.profiles?.full_name || participant.profiles?.email || 'Anonymous Hero'}
            </div>
          ))}
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
      {!loading && voteOptions.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Vote className="text-green-600" size={20} />
            <h3 className="font-semibold text-gray-800">What should the group do next?</h3>
          </div>
          
          <div className="space-y-3">
            {voteOptions.map((option, index) => {
              const voteCount = votes[option] || 0;
              const isSelected = selectedOption === option;
              
              return (
                <button
                  key={index}
                  onClick={() => submitVote(index, option)}
                  disabled={selectedOption && !isSelected}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : selectedOption
                      ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {voteCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {voteCount} vote{voteCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedOption && (
            <p className="text-sm text-green-600 mt-3 flex items-center space-x-1">
              <Clock size={14} />
              <span>Waiting for other participants to vote...</span>
            </p>
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
            <p className="text-gray-500 text-center py-8">Your epic adventure story will be recorded here...</p>
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

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🧙‍♂️ Turian is weaving the next chapter...</p>
        </div>
      )}
    </div>
  );
}
