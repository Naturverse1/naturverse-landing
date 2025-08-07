
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export default function Lobby({ onStartQuest, maxPlayers = 4 }) {
  const [players, setPlayers] = useState([]);
  const [lobbyCode, setLobbyCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('forest');
  const [questDifficulty, setQuestDifficulty] = useState('medium');
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Simulate initial lobby state
    if (user) {
      setPlayers([{
        id: user.id,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || '🐢',
        ready: false,
        isHost: true,
        region: selectedRegion
      }]);
      setIsHost(true);
      setLobbyCode(generateLobbyCode());
    }
  }, [user]);

  const generateLobbyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const regions = [
    { id: 'forest', name: 'Enchanted Forest', emoji: '🌲', color: 'green' },
    { id: 'ocean', name: 'Ocean Depths', emoji: '🌊', color: 'blue' },
    { id: 'mountain', name: 'Sky Mountains', emoji: '🏔️', color: 'gray' },
    { id: 'desert', name: 'Golden Desert', emoji: '🏜️', color: 'yellow' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy Explorer', emoji: '🌱', description: 'Simple quests for beginners' },
    { id: 'medium', name: 'Nature Scout', emoji: '🎯', description: 'Balanced adventure and learning' },
    { id: 'hard', name: 'Eco Master', emoji: '⚡', description: 'Challenging quests for experts' }
  ];

  const addPlayer = (playerData) => {
    if (players.length >= maxPlayers) return;
    
    const newPlayer = {
      id: uuidv4(),
      name: playerData.name || `Player ${players.length + 1}`,
      avatar: playerData.avatar || '🧙‍♂️',
      ready: false,
      isHost: false,
      joinedAt: new Date(),
      region: selectedRegion
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    addMessage(`${newPlayer.name} joined the quest!`, 'system');
  };

  const removePlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      addMessage(`${player.name} left the quest.`, 'system');
    }
  };

  const togglePlayerReady = (playerId) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, ready: !player.ready }
        : player
    ));
  };

  const addMessage = (message, type = 'chat', sender = null) => {
    const newMsg = {
      id: uuidv4(),
      message,
      type,
      sender: sender || (user ? user.user_metadata?.full_name || user.email : 'System'),
      timestamp: new Date()
    };
    setMessages(prev => [...prev.slice(-49), newMsg]); // Keep last 50 messages
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    addMessage(newMessage, 'chat');
    setNewMessage('');
  };

  const startQuest = () => {
    if (!isHost) return;
    
    const readyPlayers = players.filter(p => p.ready || p.isHost);
    if (readyPlayers.length < 1) {
      addMessage('At least one player must be ready to start!', 'error');
      return;
    }

    const questData = {
      players: readyPlayers,
      region: selectedRegion,
      difficulty: questDifficulty,
      lobbyCode,
      startTime: new Date()
    };

    if (onStartQuest) {
      onStartQuest(questData);
    }
  };

  const joinLobby = async (code) => {
    setIsConnecting(true);
    // Simulate joining logic
    setTimeout(() => {
      if (code === lobbyCode) {
        addMessage('Successfully joined the lobby!', 'success');
      } else {
        addMessage('Invalid lobby code. Try again.', 'error');
      }
      setIsConnecting(false);
    }, 1000);
  };

  const canStartQuest = () => {
    return isHost && players.some(p => p.ready || p.isHost);
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-green-800 mb-2'>
          🌟 Multiplayer Quest Lobby
        </h1>
        <div className='flex justify-center items-center space-x-4'>
          <div className='bg-white px-4 py-2 rounded-lg shadow'>
            <span className='font-bold text-gray-600'>Lobby Code: </span>
            <span className='font-mono text-lg text-blue-600'>{lobbyCode}</span>
          </div>
          <div className='bg-white px-4 py-2 rounded-lg shadow'>
            <span className='font-bold text-gray-600'>Players: </span>
            <span className='text-lg text-green-600'>{players.length}/{maxPlayers}</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Players Panel */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-lg p-4 shadow'>
            <h2 className='text-xl font-bold mb-4 text-gray-800'>👥 Adventurers</h2>
            <div className='space-y-3'>
              {players.map(player => (
                <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${player.ready ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>{player.avatar}</div>
                    <div>
                      <div className='font-bold text-gray-800 flex items-center'>
                        {player.name}
                        {player.isHost && <span className='ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'>HOST</span>}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Preferred: {regions.find(r => r.id === player.region)?.name || 'Any Region'}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {player.ready ? (
                      <span className='text-green-600 font-bold'>✅ Ready</span>
                    ) : (
                      <span className='text-gray-500'>⏳ Not Ready</span>
                    )}
                    {player.id === user?.id && (
                      <button
                        onClick={() => togglePlayerReady(player.id)}
                        className={`px-3 py-1 rounded text-sm font-bold ${player.ready ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        {player.ready ? 'Not Ready' : 'Ready Up'}
                      </button>
                    )}
                    {isHost && player.id !== user?.id && (
                      <button
                        onClick={() => removePlayer(player.id)}
                        className='px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600'
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {players.length < maxPlayers && (
                <button
                  onClick={() => addPlayer({ name: `Explorer ${players.length + 1}` })}
                  className='w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors'
                >
                  + Add AI Companion (Demo)
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className='bg-white rounded-lg p-4 shadow mt-4'>
            <h3 className='text-lg font-bold mb-3 text-gray-800'>💬 Quest Chat</h3>
            <div className='bg-gray-50 rounded-lg p-3 h-32 overflow-y-auto mb-3'>
              {messages.map(msg => (
                <div key={msg.id} className={`text-sm mb-1 ${msg.type === 'system' ? 'text-blue-600 italic' : msg.type === 'error' ? 'text-red-600' : 'text-gray-700'}`}>
                  <span className='font-bold'>{msg.sender}:</span> {msg.message}
                </div>
              ))}
            </div>
            <div className='flex space-x-2'>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50'
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className='space-y-4'>
          {/* Region Selection */}
          <div className='bg-white rounded-lg p-4 shadow'>
            <h3 className='text-lg font-bold mb-3 text-gray-800'>🗺️ Region</h3>
            <div className='space-y-2'>
              {regions.map(region => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  disabled={!isHost}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${selectedRegion === region.id ? `bg-${region.color}-100 border-${region.color}-500 border-2` : 'bg-gray-50 border border-gray-200'} ${!isHost && 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className='flex items-center space-x-2'>
                    <span className='text-xl'>{region.emoji}</span>
                    <span className='font-bold'>{region.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className='bg-white rounded-lg p-4 shadow'>
            <h3 className='text-lg font-bold mb-3 text-gray-800'>⚡ Difficulty</h3>
            <select
              value={questDifficulty}
              onChange={(e) => setQuestDifficulty(e.target.value)}
              disabled={!isHost}
              className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
            >
              {difficulties.map(diff => (
                <option key={diff.id} value={diff.id}>
                  {diff.emoji} {diff.name}
                </option>
              ))}
            </select>
            <p className='text-sm text-gray-600 mt-2'>
              {difficulties.find(d => d.id === questDifficulty)?.description}
            </p>
          </div>

          {/* Join Lobby */}
          {!isHost && (
            <div className='bg-white rounded-lg p-4 shadow'>
              <h3 className='text-lg font-bold mb-3 text-gray-800'>🔗 Join Quest</h3>
              <div className='flex space-x-2'>
                <input
                  type="text"
                  placeholder="Enter lobby code"
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg'
                />
                <button
                  onClick={() => joinLobby('DEMO')}
                  disabled={isConnecting}
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50'
                >
                  {isConnecting ? '⏳' : 'Join'}
                </button>
              </div>
            </div>
          )}

          {/* Start Quest */}
          <div className='bg-white rounded-lg p-4 shadow'>
            <button
              onClick={startQuest}
              disabled={!canStartQuest()}
              className={`w-full py-4 rounded-lg text-xl font-bold transition-all ${canStartQuest() ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {canStartQuest() ? '🚀 Start Quest Adventure!' : '⏳ Waiting for Players...'}
            </button>
            {isHost && (
              <p className='text-xs text-gray-500 mt-2 text-center'>
                As host, you can start when ready
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
