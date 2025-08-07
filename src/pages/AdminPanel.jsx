
import React, { useEffect, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tab } from '@headlessui/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiAward, 
  FiSettings,
  FiBarChart3,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX
} from 'react-icons/fi'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [stats, setStats] = useState({})
  const [modules, setModules] = useState([])
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [stamps, setStamps] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Avatars',
    price_natur: 0,
    description: '',
    image_url: '',
    rarity: 'common'
  })
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const tabCategories = [
    { name: 'Dashboard', icon: FiBarChart3 },
    { name: 'Users', icon: FiUsers },
    { name: 'Marketplace', icon: FiShoppingBag },
    { name: 'Learning', icon: FiPackage },
    { name: 'Stamps', icon: FiAward },
    { name: 'Settings', icon: FiSettings }
  ]

  useEffect(() => {
    if (!user || user.isGuest) {
      navigate('/')
      return
    }
    
    loadAdminData()
  }, [user, navigate])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      // Load stats
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }

      // Load marketplace items
      const { data: marketItems } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false })
      setItems(marketItems || [])

      // Load learning modules (mock data since table might not exist)
      setModules([
        { id: 1, title: 'Forest Adventures', status: 'active', students: 45 },
        { id: 2, title: 'Ocean Exploration', status: 'draft', students: 0 },
        { id: 3, title: 'Sky Mountains', status: 'active', students: 32 }
      ])

      // Load recent users
      const { data: userData } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      setUsers(userData || [])

    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('market_items')
        .insert({
          ...formData,
          price_natur: parseInt(formData.price_natur),
          metadata: {}
        })

      if (error) throw error
      
      setShowAddForm(false)
      setFormData({
        name: '',
        category: 'Avatars',
        price_natur: 0,
        description: '',
        image_url: '',
        rarity: 'common'
      })
      loadAdminData()
      alert('Item added successfully!')
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error adding item')
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const { error } = await supabase
        .from('market_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      loadAdminData()
      alert('Item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item')
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <FiUsers className="h-8 w-8 mb-2" />
          <div className="text-2xl font-bold">{stats.total_users || 0}</div>
          <div className="text-sm opacity-90">Total Users</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <FiAward className="h-8 w-8 mb-2" />
          <div className="text-2xl font-bold">{stats.completed_quests || 0}</div>
          <div className="text-sm opacity-90">Completed Quests</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <FiPackage className="h-8 w-8 mb-2" />
          <div className="text-2xl font-bold">{stats.total_quizzes || 0}</div>
          <div className="text-sm opacity-90">Total Quizzes</div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <FiShoppingBag className="h-8 w-8 mb-2" />
          <div className="text-2xl font-bold">{items.length}</div>
          <div className="text-sm opacity-90">Marketplace Items</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.topScorers?.slice(0, 5).map((scorer, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <span className="font-medium">User {scorer.user_id.substring(0, 8)}...</span>
                <span className="text-sm text-gray-500 ml-2">completed a quiz</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {scorer.score}%
              </span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-8">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Marketplace Items</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-nature-green hover:bg-nature-green/90 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rarity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image_url && (
                        <img className="h-10 w-10 rounded-lg mr-3" src={item.image_url} alt={item.name} />
                      )}
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price_natur} $NATUR</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      item.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                      item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      item.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">User Management</h3>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center text-gray-500">
            <FiUsers className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>User management features coming soon...</p>
            <p className="text-sm mt-2">Total Users: {stats.total_users || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 0: return renderDashboard()
      case 1: return renderUsers()
      case 2: return renderMarketplace()
      default: return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-500">
            <FiSettings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>This section is under development</p>
          </div>
        </div>
      )
    }
  }

  if (!user || user.isGuest) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Control Panel</h1>
          <p className="text-gray-600">The Naturverse™ Administration</p>
        </div>

        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            {tabCategories.map((category, index) => (
              <Tab
                key={category.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 text-blue-700',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <category.icon className="mr-2 h-4 w-4" />
                  {category.name}
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            {tabCategories.map((_, index) => (
              <Tab.Panel key={index} className="rounded-xl bg-white/10 p-3">
                {renderContent()}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Item</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  >
                    <option value="Avatars">Avatars</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Power-Ups">Power-Ups</option>
                    <option value="Stamps">Stamps</option>
                    <option value="NFT Collectibles">NFT Collectibles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($NATUR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price_natur}
                    onChange={(e) => setFormData({...formData, price_natur: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="legendary">Legendary</option>
                    <option value="cosmic">Cosmic</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-nature-green hover:bg-nature-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
