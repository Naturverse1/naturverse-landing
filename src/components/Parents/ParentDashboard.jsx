
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Users, BookOpen, TrendingUp, Clock, Award } from 'lucide-react';

const ParentDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    completedQuizzes: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users data
        const { data: usersData } = await supabase
          .from('users')
          .select('id, username, email, learning_track, created_at')
          .order('created_at', { ascending: false });
        
        setUsers(usersData || []);

        // Fetch quiz attempts for stats
        const { data: quizData } = await supabase
          .from('user_quiz_attempts')
          .select('user_id, score, created_at');

        // Calculate stats
        const totalUsers = usersData?.length || 0;
        const today = new Date().toDateString();
        const activeToday = usersData?.filter(user => 
          new Date(user.created_at).toDateString() === today
        ).length || 0;
        
        const completedQuizzes = quizData?.length || 0;
        const averageScore = quizData?.length > 0 
          ? Math.round(quizData.reduce((sum, quiz) => sum + quiz.score, 0) / quizData.length)
          : 0;

        setStats({
          totalUsers,
          activeToday,
          completedQuizzes,
          averageProgress: averageScore
        });

      } catch (error) {
        console.error('Error fetching parent dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrackEmoji = (track) => {
    const emojis = {
      storytelling: '📖',
      nature: '🌱',
      music: '🎵',
      math: '🔢',
      language: '🗣️',
      movement: '🏃'
    };
    return emojis[track] || '📚';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading parent dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Shield className="mr-3 text-purple-600" size={36} />
          🛡️ Parent Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Monitor your children's learning progress and activities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Learners</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users size={40} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Today</p>
              <p className="text-3xl font-bold">{stats.activeToday}</p>
            </div>
            <Clock size={40} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Quizzes Completed</p>
              <p className="text-3xl font-bold">{stats.completedQuizzes}</p>
            </div>
            <BookOpen size={40} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Average Score</p>
              <p className="text-3xl font-bold">{stats.averageProgress}%</p>
            </div>
            <TrendingUp size={40} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Users className="mr-2" size={24} />
            Learning Progress Overview
          </h2>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    👤 Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📧 Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📚 Learning Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📅 Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username || 'Anonymous User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || 'No email provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.learning_track ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTrackEmoji(user.learning_track)} {user.learning_track}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h3>
            <p className="text-gray-500">Learners will appear here once they start using the platform.</p>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Safety & Privacy</h3>
            <p className="text-blue-700 text-sm">
              The Naturverse is designed with child safety in mind. All interactions are monitored, 
              and we use age-appropriate content filtering. Your children's data is protected and never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
