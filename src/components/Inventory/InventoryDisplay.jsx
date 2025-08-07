
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Zap, Sparkles } from 'lucide-react';

export default function InventoryDisplay({ userId }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId, user?.id]);

  async function loadData() {
    try {
      // Load inventory
      const { data: inventoryData, error: invError } = await supabase
        .from('user_inventory')
        .select(`
          *,
          game_items (*)
        `)
        .eq('user_id', userId || user?.id)
        .order('acquired_at', { ascending: false });

      if (invError) throw invError;

      // Load recipes
      const { data: recipeData, error: recipeError } = await supabase
        .from('item_recipes')
        .select(`
          *,
          game_items!item_recipes_output_item_id_fkey (*)
        `);

      if (recipeError) throw recipeError;

      setItems(inventoryData || []);
      setRecipes(recipeData || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  async function useItem(item) {
    if (item.game_items.type !== 'consumable') {
      alert('This item cannot be consumed!');
      return;
    }

    try {
      await supabase.rpc('decrease_item_quantity', {
        user_id_input: user.id,
        item_id_input: item.item_id,
        amount: 1
      });

      // Apply item effect (simplified)
      const effect = item.game_items.effect;
      if (effect?.energy_restore) {
        alert(`🌟 You restored ${effect.energy_restore} energy!`);
      }
      
      await loadData(); // Refresh inventory
    } catch (error) {
      console.error('Error using item:', error);
      alert('Failed to use item');
    }
  }

  async function craftItem(recipe) {
    const requirements = JSON.parse(recipe.required_items);
    const userItems = items.reduce((acc, item) => {
      acc[item.item_id] = item.quantity;
      return acc;
    }, {});

    // Check if user has required items
    for (let req of requirements) {
      if (!userItems[req.item_id] || userItems[req.item_id] < req.quantity) {
        alert('You don\'t have enough materials for this recipe!');
        return;
      }
    }

    try {
      const response = await fetch('/api/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.id
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`🎉 Successfully crafted ${recipe.game_items.name}!`);
        await loadData(); // Refresh inventory
      } else {
        alert('Crafting failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Crafting error:', error);
      alert('Failed to craft item');
    }
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'rare': return '💎';
      case 'epic': return '⚡';
      case 'legendary': return '👑';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'inventory'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="inline mr-1" size={16} />
          Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('crafting')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'crafting'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="inline mr-1" size={16} />
          Crafting ({recipes.length})
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Your inventory is empty!</p>
              <p className="text-sm text-gray-500 mt-2">
                Complete quests and activities to collect items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-shadow ${getRarityColor(item.game_items.rarity)}`}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                >
                  <div className="absolute top-2 right-2 text-lg">
                    {getRarityIcon(item.game_items.rarity)}
                  </div>
                  
                  <img
                    src={item.game_items.image_url || '/items/default.png'}
                    alt={item.game_items.name}
                    className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/items/default.png';
                    }}
                  />
                  
                  <h3 className="text-sm font-semibold text-center truncate">
                    {item.game_items.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600 capitalize">
                      {item.game_items.type}
                    </span>
                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                      x{item.quantity}
                    </span>
                  </div>

                  {selectedItem?.id === item.id && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600">
                        {item.game_items.description}
                      </p>
                      {item.game_items.type === 'consumable' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            useItem(item);
                          }}
                          className="w-full bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                        >
                          <Zap className="inline mr-1" size={12} />
                          Use Item
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Crafting Tab */}
      {activeTab === 'crafting' && (
        <div>
          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No crafting recipes available!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={recipe.game_items.image_url || '/items/default.png'}
                        alt={recipe.game_items.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/items/default.png';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {recipe.game_items.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {recipe.game_items.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => craftItem(recipe)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center"
                    >
                      <Sparkles className="mr-1" size={16} />
                      Craft
                    </button>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Required Materials:</h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(recipe.required_items).map((req, index) => {
                        const requiredItem = items.find(item => item.item_id === req.item_id);
                        const hasEnough = requiredItem && requiredItem.quantity >= req.quantity;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                              hasEnough
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span>{req.quantity}x</span>
                            <span>{requiredItem?.game_items?.name || 'Unknown Item'}</span>
                            {hasEnough ? '✅' : '❌'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
