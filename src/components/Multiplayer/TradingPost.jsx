
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightLeft, Package, User, Clock, Check, X } from 'lucide-react';

export default function TradingPost() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedOfferedItem, setSelectedOfferedItem] = useState('');
  const [selectedRequestedItem, setSelectedRequestedItem] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [tradeMessage, setTradeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // received, sent, create

  useEffect(() => {
    if (user) {
      loadData();
      
      // Set up real-time subscription for trades
      const channel = supabase
        .channel('trades-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'item_trades'
          },
          () => {
            loadTrades();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function loadData() {
    await Promise.all([loadTrades(), loadInventory()]);
    setLoading(false);
  }

  async function loadTrades() {
    try {
      const { data, error } = await supabase
        .from('item_trades')
        .select(`
          *,
          sender:sender_id(id, email),
          receiver:receiver_id(id, email),
          offered_item:offered_item_id(name, image_url, rarity),
          requested_item:requested_item_id(name, image_url, rarity)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  }

  async function loadInventory() {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          game_items(*)
        `)
        .eq('user_id', user.id)
        .gt('quantity', 0);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  async function createTrade() {
    if (!selectedOfferedItem || !selectedRequestedItem || !targetUser) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Find receiver by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', targetUser)
        .single();

      if (userError || !userData) {
        alert('User not found');
        return;
      }

      // Check if receiver has the requested item
      const { data: receiverInventory, error: invError } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userData.id)
        .eq('item_id', selectedRequestedItem)
        .gt('quantity', 0)
        .single();

      if (invError || !receiverInventory) {
        alert('The user does not have the requested item');
        return;
      }

      const { error } = await supabase
        .from('item_trades')
        .insert({
          sender_id: user.id,
          receiver_id: userData.id,
          offered_item_id: selectedOfferedItem,
          requested_item_id: selectedRequestedItem,
          message: tradeMessage
        });

      if (error) throw error;

      // Reset form
      setSelectedOfferedItem('');
      setSelectedRequestedItem('');
      setTargetUser('');
      setTradeMessage('');
      alert('Trade request sent successfully!');
      
      await loadTrades();
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Failed to create trade request');
    }
  }

  async function respondToTrade(tradeId, accept) {
    try {
      if (accept) {
        // Execute the trade
        const trade = trades.find(t => t.id === tradeId);
        if (!trade) return;

        // Update trade status
        await supabase
          .from('item_trades')
          .update({ status: 'accepted' })
          .eq('id', tradeId);

        // Execute the actual item exchange via API
        const response = await fetch('/api/execute-trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId })
        });

        const result = await response.json();
        if (result.success) {
          alert('Trade completed successfully!');
          await loadData();
        } else {
          throw new Error(result.error || 'Trade execution failed');
        }
      } else {
        // Reject the trade
        await supabase
          .from('item_trades')
          .update({ status: 'rejected' })
          .eq('id', tradeId);

        alert('Trade request rejected');
        await loadTrades();
      }
    } catch (error) {
      console.error('Error responding to trade:', error);
      alert('Failed to process trade response');
    }
  }

  const getTradesForTab = () => {
    switch (activeTab) {
      case 'received':
        return trades.filter(t => t.receiver_id === user.id && t.status === 'pending');
      case 'sent':
        return trades.filter(t => t.sender_id === user.id);
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading trading post...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <ArrowRightLeft className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Trading Post</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'received', label: 'Received Trades', count: trades.filter(t => t.receiver_id === user.id && t.status === 'pending').length },
          { id: 'sent', label: 'Sent Trades', count: trades.filter(t => t.sender_id === user.id).length },
          { id: 'create', label: 'Create Trade', count: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Create Trade Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Create New Trade</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offer Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What you're offering
              </label>
              <select
                value={selectedOfferedItem}
                onChange={(e) => setSelectedOfferedItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an item to offer...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.item_id}>
                    {item.game_items.name} (x{item.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Request Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What you want
              </label>
              <input
                type="text"
                value={selectedRequestedItem}
                onChange={(e) => setSelectedRequestedItem(e.target.value)}
                placeholder="Enter item name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trading partner (email)
            </label>
            <input
              type="email"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="Enter user's email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={tradeMessage}
              onChange={(e) => setTradeMessage(e.target.value)}
              placeholder="Add a message to your trade request..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={createTrade}
            className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2"
          >
            <ArrowRightLeft size={16} />
            <span>Send Trade Request</span>
          </button>
        </div>
      )}

      {/* Trade Lists */}
      {(activeTab === 'received' || activeTab === 'sent') && (
        <div className="space-y-4">
          {getTradesForTab().length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">
                No {activeTab} trades yet
              </p>
            </div>
          ) : (
            getTradesForTab().map(trade => (
              <div key={trade.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-800">
                        {activeTab === 'received' ? trade.sender.email : trade.receiver.email}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(trade.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status}
                  </span>
                </div>

                {/* Trade Details */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <img
                      src={trade.offered_item.image_url || '/items/default.png'}
                      alt={trade.offered_item.name}
                      className="w-16 h-16 mx-auto mb-2 rounded-lg"
                    />
                    <p className="text-sm font-medium">{trade.offered_item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{trade.offered_item.rarity}</p>
                  </div>
                  
                  <ArrowRightLeft className="text-gray-400" size={24} />
                  
                  <div className="text-center">
                    <img
                      src={trade.requested_item.image_url || '/items/default.png'}
                      alt={trade.requested_item.name}
                      className="w-16 h-16 mx-auto mb-2 rounded-lg"
                    />
                    <p className="text-sm font-medium">{trade.requested_item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{trade.requested_item.rarity}</p>
                  </div>
                </div>

                {trade.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{trade.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {activeTab === 'received' && trade.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToTrade(trade.id, true)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-1"
                    >
                      <Check size={16} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => respondToTrade(trade.id, false)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center space-x-1"
                    >
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
