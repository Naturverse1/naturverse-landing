
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function BadgeDisplay({ userId }) {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadges() {
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId || user?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setBadges(data || []);
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId || user?.id) {
      loadBadges();
    }
  }, [userId, user?.id]);

  async function mintBadge(badge) {
    try {
      const response = await fetch('/api/mint-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          badgeName: badge.badge_name,
          badgeImage: badge.badge_image,
          walletAddress: user.wallet_address || '0x0000000000000000000000000000000000000000'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setBadges(prev => prev.map(b => 
          b.id === badge.id ? { ...b, minted: true } : b
        ));
        alert('🎉 Badge minted successfully as NFT!');
      }
    } catch (error) {
      console.error('Minting error:', error);
      alert('Failed to mint badge. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading badges...</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏅</div>
        <p className="text-gray-600">No badges earned yet!</p>
        <p className="text-sm text-gray-500 mt-2">
          Complete quizzes and activities to earn your first badge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img 
                src={badge.badge_image || '/default-badge.png'} 
                alt={badge.badge_name}
                className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-yellow-400"
                onError={(e) => {
                  e.target.src = '/default-badge.png';
                }}
              />
              {badge.minted && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-sm text-gray-800 mb-1">
              {badge.badge_name}
            </h3>
            
            <p className="text-xs text-gray-500 mb-3">
              {new Date(badge.created_at).toLocaleDateString()}
            </p>
            
            {!badge.minted && (
              <button
                onClick={() => mintBadge(badge)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full hover:from-purple-600 hover:to-blue-600 transition-colors"
              >
                🔗 Mint NFT
              </button>
            )}
            
            {badge.minted && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                ✅ Minted
              </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🎯 Pro Tip:</strong> Mint your badges as NFTs to own them permanently on the blockchain!
        </p>
      </div>
    </div>
  );
}
