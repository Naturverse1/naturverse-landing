
import React, { useState, useEffect } from 'react';
import { FaBackpack, FaTimes, FaPlus, FaGift } from 'react-icons/fa';

export default function InventoryDrawer({ userItems = [], onItemUse, onItemRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);

  // Default items for demo
  const defaultItems = [
    { 
      id: 'magic-seed', 
      name: 'Magic Seed', 
      emoji: '🌰', 
      type: 'quest-item',
      description: 'A mysterious seed that glows with natural magic. Plant it to grow something amazing!',
      rarity: 'uncommon',
      quantity: 3
    },
    { 
      id: 'quest-token', 
      name: 'Quest Token', 
      emoji: '🧿', 
      type: 'currency',
      description: 'A special token earned from completing quests. Can be traded for valuable items.',
      rarity: 'common',
      quantity: 12
    },
    { 
      id: 'healing-potion', 
      name: 'Healing Potion', 
      emoji: '🧪', 
      type: 'consumable',
      description: 'Restores energy and health. Tastes like tropical fruits!',
      rarity: 'common',
      quantity: 5
    },
    { 
      id: 'wisdom-crystal', 
      name: 'Wisdom Crystal', 
      emoji: '💎', 
      type: 'artifact',
      description: 'Contains ancient knowledge. Use it to get hints during difficult quests.',
      rarity: 'rare',
      quantity: 1
    },
    { 
      id: 'nature-compass', 
      name: 'Nature Compass', 
      emoji: '🧭', 
      type: 'tool',
      description: 'Points toward the nearest natural wonder or hidden secret.',
      rarity: 'uncommon',
      quantity: 1
    }
  ];

  useEffect(() => {
    // Combine user items with default items
    const combinedItems = [...defaultItems, ...userItems];
    setItems(combinedItems);
  }, [userItems]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quest-item': return '🎯';
      case 'currency': return '💰';
      case 'consumable': return '🍃';
      case 'artifact': return '⚡';
      case 'tool': return '🔧';
      default: return '📦';
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const useItem = (item) => {
    if (onItemUse) {
      onItemUse(item);
    }
    
    // Update quantity
    setItems(prevItems => 
      prevItems.map(i => 
        i.id === item.id 
          ? { ...i, quantity: Math.max(0, i.quantity - 1) }
          : i
      ).filter(i => i.quantity > 0)
    );
    
    setSelectedItem(null);
  };

  const removeItem = (item) => {
    if (onItemRemove) {
      onItemRemove(item);
    }
    
    setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    setSelectedItem(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Inventory Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 relative"
      >
        <FaBackpack size={24} />
        {totalItems > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems > 99 ? '99+' : totalItems}
          </div>
        )}
      </button>

      {/* Inventory Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-100 p-3 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaBackpack className="text-orange-600" />
              <h4 className="font-bold text-gray-800">Inventory</h4>
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                {totalItems} items
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto">
            {items.length > 0 ? (
              <div className="space-y-1 p-2">
                {items.map((item) => (
                  <div key={item.id}>
                    <div
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center space-x-3 p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        getRarityColor(item.rarity)
                      } ${selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">{item.name}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-600">{getTypeIcon(item.type)}</span>
                            <span className="text-sm font-bold text-gray-600">x{item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            item.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                            item.rarity === 'uncommon' ? 'bg-green-200 text-green-700' :
                            item.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                            item.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                            'bg-yellow-200 text-yellow-700'
                          }`}>
                            {item.rarity}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{item.type.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    {selectedItem?.id === item.id && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200 mt-1 mx-2">
                        <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                        <div className="flex space-x-2">
                          {item.type === 'consumable' && (
                            <button
                              onClick={() => useItem(item)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Use Item
                            </button>
                          )}
                          <button
                            onClick={() => removeItem(item)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FaGift size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-bold mb-1">Empty Inventory</p>
                <p className="text-sm">Complete quests to collect items!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-3 border-t text-center">
            <button
              onClick={() => {/* Add logic to open full inventory page */}}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 w-full"
            >
              Open Full Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
