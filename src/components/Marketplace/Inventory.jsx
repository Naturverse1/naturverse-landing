
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const defaultItems = [
    { id: 1, name: '🍍 Pineapple Sword', rarity: 'Rare', category: 'Weapon' },
    { id: 2, name: '🎒 Nature Backpack', rarity: 'Common', category: 'Gear' },
    { id: 3, name: '🎭 Festival Mask', rarity: 'Epic', category: 'Cosmetic' },
    { id: 4, name: '🌿 Healing Leaves', rarity: 'Common', category: 'Consumable' },
    { id: 5, name: '✨ Magic Compass', rarity: 'Legendary', category: 'Tool' }
  ];

  useEffect(() => {
    const loadInventory = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/inventory/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setItems(data.inventory?.length > 0 ? data.inventory : defaultItems);
          } else {
            setItems(defaultItems);
          }
        } catch (error) {
          console.error('Failed to load inventory:', error);
          setItems(defaultItems);
        }
      } else {
        setItems(defaultItems);
      }
      setLoading(false);
    };

    loadInventory();
  }, [user]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100';
      case 'Rare': return 'text-blue-600 bg-blue-100';
      case 'Epic': return 'text-purple-600 bg-purple-100';
      case 'Legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className='p-6 bg-white rounded-lg shadow-lg'>
        <div className='animate-pulse'>
          <h2 className='text-2xl font-bold mb-4'>🎒 Your Inventory</h2>
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4 text-nature-green'>🎒 Your Inventory</h2>
      <div className='space-y-3'>
        {items.map((item, idx) => (
          <div key={item.id || idx} className='flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50'>
            <div className='flex items-center space-x-3'>
              <span className='text-lg'>{item.name}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </span>
            </div>
            <span className='text-sm text-gray-500'>{item.category}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            <p>Your inventory is empty!</p>
            <p className='text-sm'>Visit the marketplace to get some items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
