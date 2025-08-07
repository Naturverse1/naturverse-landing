
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, MapPin, Clock, Crown } from 'lucide-react';

export default function LobbyList({ region = 'Thailandia' }) {
  const { user } = useAuth();
  const [lobbies, setLobbies] = useState([]);
  const [newLobbyName, setNewLobbyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLobbies();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('lobbies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_lobbies'
        },
        () => {
          fetchLobbies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants'
        },
        () => {
          fetchLobbies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [region]);

  async function fetchLobbies() {
    try {
      const { data, error } = await supabase
        .from('multiplayer_lobbies')
        .select(`
          *,
          lobby_participants(
            user_id,
            joined_at
          )
        `)
        .eq('region', region)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLobbies(data || []);
    } catch (error) {
      console.error('Error fetching lobbies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createLobby() {
    if (!newLobbyName.trim() || !user) return;

    setCreating(true);
    try {
      // Create lobby
      const { data: lobby, error: lobbyError } = await supabase
        .from('multiplayer_lobbies')
        .insert({
          region,
          lobby_name: newLobbyName.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id
        });

      if (participantError) throw participantError;

      setNewLobbyName('');
      await fetchLobbies();
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function joinLobby(lobbyId) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobbyId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          alert('You are already in this lobby!');
        } else {
          throw error;
        }
      } else {
        await fetchLobbies();
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
      alert('Failed to join lobby. Please try again.');
    }
  }

  async function leaveLobby(lobbyId) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .eq('lobby_id', lobbyId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchLobbies();
    } catch (error) {
      console.error('Error leaving lobby:', error);
      alert('Failed to leave lobby. Please try again.');
    }
  }

  const getUserLobby = () => {
    return lobbies.find(lobby => 
      lobby.lobby_participants.some(p => p.user_id === user?.id)
    );
  };

  const userLobby = getUserLobby();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading lobbies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="text-green-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            Co-Op Lobbies
          </h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            {region}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>{lobbies.length} active lobbies</span>
        </div>
      </div>

      {/* Create Lobby */}
      {!userLobby && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Create New Lobby</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newLobbyName}
              onChange={(e) => setNewLobbyName(e.target.value)}
              placeholder="Enter lobby name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && createLobby()}
            />
            <button
              onClick={createLobby}
              disabled={!newLobbyName.trim() || creating}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>{creating ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Current Lobby */}
      {userLobby && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800">
              🎯 You're in: {userLobby.lobby_name}
            </h3>
            <button
              onClick={() => leaveLobby(userLobby.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Leave Lobby
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-green-700">
            <div className="flex items-center space-x-1">
              <Users size={16} />
              <span>{userLobby.current_players}/{userLobby.max_players} players</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>Created {new Date(userLobby.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Available Lobbies */}
      <div className="space-y-3">
        {lobbies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">No active lobbies in {region}</p>
            <p className="text-sm text-gray-500">Create the first one to start playing with friends!</p>
          </div>
        ) : (
          lobbies.map((lobby) => {
            const isParticipant = lobby.lobby_participants.some(p => p.user_id === user?.id);
            const isCreator = lobby.created_by === user?.id;
            const isFull = lobby.current_players >= lobby.max_players;

            return (
              <div
                key={lobby.id}
                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isParticipant ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {lobby.lobby_name}
                      </h3>
                      {isCreator && (
                        <Crown className="text-yellow-500" size={16} title="Lobby Creator" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{lobby.current_players}/{lobby.max_players}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{new Date(lobby.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isParticipant ? (
                      <button
                        onClick={() => leaveLobby(lobby.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => joinLobby(lobby.id)}
                        disabled={isFull}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          isFull
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isFull ? 'Full' : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
