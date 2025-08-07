
import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Heart, Gamepad2, Trophy } from 'lucide-react';
import { emotes, emoteCategories } from '../../data/emotes';
import { useAuth } from '../../contexts/AuthContext';

const PlayerHub = () => {
  const { user } = useAuth();
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [selectedEmote, setSelectedEmote] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    // Simulate online players
    setOnlinePlayers([
      { id: 1, name: 'EcoExplorer23', avatar: '🌱', status: 'online', level: 15, region: 'Golden Grove' },
      { id: 2, name: 'NatureLover', avatar: '🦋', status: 'online', level: 22, region: 'Lotus Lake' },
      { id: 3, name: 'TreeHugger', avatar: '🌳', status: 'away', level: 8, region: 'Royal Canopy' },
      { id: 4, name: 'OceanDreamer', avatar: '🐠', status: 'online', level: 31, region: 'Coral Kingdom' },
    ]);

    // Simulate chat messages
    setChatMessages([
      { id: 1, user: 'EcoExplorer23', message: '👋', type: 'emote', timestamp: Date.now() - 120000 },
      { id: 2, user: 'NatureLover', message: '🎉', type: 'emote', timestamp: Date.now() - 60000 },
      { id: 3, user: 'TreeHugger', message: '🌿', type: 'emote', timestamp: Date.now() - 30000 },
    ]);
  }, []);

  const sendEmote = (emote) => {
    if (!user) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      user: user.email?.split('@')[0] || 'Player',
      message: emote,
      type: 'emote',
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setSelectedEmote('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center">
            <Users className="mr-3" />
            🧑‍🤝‍🧑 Player Hub
          </h1>
          <p className="text-xl text-green-600 mb-4">Connect, Chat, and Play Together!</p>
          <p className="text-gray-600">Join the community of nature explorers</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'players'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 Online Players
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'chat'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬 Emote Chat
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'activities'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎮 Activities
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'players' && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="mr-2" />
                  Online Players ({onlinePlayers.filter(p => p.status === 'online').length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onlinePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="text-3xl">{player.avatar}</div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(player.status)}`}></div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{player.name}</h3>
                          <p className="text-sm text-gray-600">Level {player.level} • {player.region}</p>
                          <div className="flex items-center mt-1">
                            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(player.status)}`}></div>
                            <span className="text-xs text-gray-500 capitalize">{player.status}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
                            <MessageCircle size={16} />
                          </button>
                          <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors">
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MessageCircle className="mr-2" />
                  Emote Chat
                </h2>

                {/* Chat Messages */}
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-6">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="flex items-center space-x-3">
                        <span className="font-semibold text-blue-600">{msg.user}:</span>
                        <span className="text-2xl">{msg.message}</span>
                        <span className="text-xs text-gray-500 ml-auto">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emote Selector */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Send an Emote:</h3>
                  <div className="grid grid-cols-8 gap-2">
                    {emotes.map((emote) => (
                      <button
                        key={emote}
                        onClick={() => sendEmote(emote)}
                        className="text-2xl p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform"
                      >
                        {emote}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Gamepad2 className="mr-2" />
                  Group Activities
                </h2>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🏆 Weekly Challenge</h3>
                    <p className="text-gray-600 mb-3">Plant 100 virtual trees together as a community!</p>
                    <div className="bg-white rounded-full h-4 overflow-hidden">
                      <div className="bg-green-500 h-full w-3/4 transition-all"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Progress: 75/100 trees</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🎯 Daily Quest</h3>
                    <p className="text-gray-600 mb-3">Explore 3 new regions with friends</p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                      Join Quest
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🎮 Mini-Game Tournament</h3>
                    <p className="text-gray-600 mb-3">Nature trivia showdown - starts in 2 hours!</p>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Status */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Status</h3>
              
              {user ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <h4 className="font-bold text-gray-800">{user.email?.split('@')[0] || 'Player'}</h4>
                  <p className="text-gray-600 text-sm">Level 12 Explorer</p>
                  <div className="flex justify-center mt-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 ml-2">Online</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">Sign in to join the community!</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Community Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Online Now:</span>
                  <span className="font-bold text-green-600">{onlinePlayers.filter(p => p.status === 'online').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Today:</span>
                  <span className="font-bold text-blue-600">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trees Planted:</span>
                  <span className="font-bold text-green-600">8,429</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quests Completed:</span>
                  <span className="font-bold text-purple-600">1,203</span>
                </div>
              </div>
            </div>

            {/* Emote Categories */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Emote Categories</h3>
              
              <div className="space-y-3">
                {Object.entries(emoteCategories).map(([category, categoryEmotes]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="flex space-x-1">
                      {categoryEmotes.map((emote) => (
                        <button
                          key={emote}
                          onClick={() => sendEmote(emote)}
                          className="text-xl p-1 hover:scale-110 transition-transform"
                        >
                          {emote}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
          <div className="text-2xl mb-2">🌍💚</div>
          <p className="text-green-800 font-semibold italic">
            "Together we grow, together we explore, together we protect our world!"
          </p>
          <p className="text-green-600 text-sm mt-2">- The Naturverse Community</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerHub;
