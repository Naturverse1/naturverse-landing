
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TradingPost from '../components/Multiplayer/TradingPost';
import { Navigate } from 'react-router-dom';

export default function Trading() {
  const { user } = useAuth();

  if (!user || user.isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <TradingPost />
      </div>
    </div>
  );
}
