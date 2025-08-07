import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import dayjs from 'dayjs';
import { FiUsers, FiTrendingUp, FiActivity, FiBarChart } from 'react-icons/fi';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch data from various tables with error handling
        const [
          { data: users, error: usersError },
          { data: quizzes, error: quizzesError },
          { data: purchases, error: purchasesError },
          { data: rewards, error: rewardsError }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('quiz_results').select('*'),
          supabase.from('user_purchases').select('*'),
          supabase.from('natur_rewards').select('*')
        ]);

        // Handle potential errors and null data
        const userData = users || [];
        const quizData = quizzes || [];
        const purchaseData = purchases || [];
        const rewardData = rewards || [];

        // Process data for charts
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          return {
            date: dayjs().subtract(i, 'day').format('MMM DD'),
            users: userData.filter(u => dayjs(u.created_at).format('YYYY-MM-DD') === date).length,
            quizzes: quizData.filter(q => dayjs(q.created_at).format('YYYY-MM-DD') === date).length,
            purchases: purchaseData.filter(p => dayjs(p.purchase_date).format('YYYY-MM-DD') === date).length
          };
        }).reverse();

        setData({
          users: userData.length,
          quizzes: quizData.length,
          purchases: purchaseData.length,
          totalRewards: rewardData.reduce((sum, r) => sum + (r.amount || 0), 0),
          chartData: last7Days,
          activityLog: [
            ...userData.map(u => ({ ...u, type: 'user_joined', created_at: u.created_at })),
            ...quizData.map(q => ({ ...q, type: 'quiz_completed', created_at: q.created_at })),
            ...purchaseData.map(p => ({ ...p, type: 'purchase', created_at: p.purchase_date }))
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        });
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📊 Naturverse Live Analytics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Total Users" count={data.users} color="bg-blue-500" icon={<FiUsers className="h-8 w-8 text-gray-400" />} />
        <Stat title="Quizzes Completed" count={data.quizzes} color="bg-green-500" icon={<FiActivity className="h-8 w-8 text-gray-400" />} />
        <Stat title="Store Purchases" count={data.purchases} color="bg-purple-500" icon={<FiTrendingUp className="h-8 w-8 text-gray-400" />} />
        <Stat title="$NATUR Rewards" count={data.totalRewards} color="bg-yellow-500" icon={<FiBarChart className="h-8 w-8 text-gray-400" />} />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3B82F6" name="New Users" />
            <Line type="monotone" dataKey="quizzes" stroke="#10B981" name="Quizzes" />
            <Line type="monotone" dataKey="purchases" stroke="#8B5CF6" name="Purchases" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity Log */}
      <RecentActivity activity={data.activityLog.slice(0, 10)} />
    </div>
  );
}

function Stat({ title, count, color, icon }) {
  return (
    <div className={`${color} text-white rounded-lg p-4 shadow-lg flex items-center justify-between`}>
      <div>
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
        <div className="text-sm opacity-90">{title}</div>
      </div>
      {icon}
    </div>
  );
}

function RecentActivity({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_joined': return '👋';
      case 'quiz_completed': return '🎯';
      case 'purchase': return '🛒';
      default: return '📋';
    }
  };

  const getActivityText = (item) => {
    switch (item.type) {
      case 'user_joined':
        return `New user joined: ${item.email || item.id?.substring(0, 8)}`;
      case 'quiz_completed':
        return `Quiz completed with ${item.score || 0}% score`;
      case 'purchase':
        return `Item purchased for ${item.price_natur || 0} $NATUR`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activity.length > 0 ? activity.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getActivityIcon(item.type)}</span>
              <div>
                <p className="text-sm text-gray-800">{getActivityText(item)}</p>
                <p className="text-xs text-gray-500">
                  {dayjs(item.created_at).format('MMM D, YYYY h:mm A')}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-8">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}