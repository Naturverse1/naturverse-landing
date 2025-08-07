
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Package, Coins, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MarketplaceAdmin = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Avatars',
    image_url: '',
    price_natur: 0,
    price_usd: 0,
    is_nft: false,
    metadata: '{}',
    stock: 1,
    rarity: 'common',
    description: ''
  })
  const { user } = useAuth()

  const categories = ['Avatars', 'Accessories', 'Power-Ups', 'Stamps', 'NFT Collectibles']
  const rarities = ['common', 'uncommon', 'rare', 'legendary', 'cosmic']

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const itemData = {
        ...formData,
        price_natur: parseInt(formData.price_natur),
        price_usd: parseFloat(formData.price_usd),
        stock: parseInt(formData.stock),
        metadata: JSON.parse(formData.metadata || '{}')
      }

      if (editingItem) {
        const { error } = await supabase
          .from('market_items')
          .update(itemData)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('market_items')
          .insert(itemData)

        if (error) throw error
      }

      resetForm()
      loadItems()
      alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!')
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving item. Please check the metadata JSON format.')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      ...item,
      metadata: JSON.stringify(item.metadata, null, 2)
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('market_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      loadItems()
      alert('Item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Avatars',
      image_url: '',
      price_natur: 0,
      price_usd: 0,
      is_nft: false,
      metadata: '{}',
      stock: 1,
      rarity: 'common',
      description: ''
    })
    setEditingItem(null)
    setShowAddForm(false)
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
          <p className="text-gray-600">Loading marketplace admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketplace Admin</h1>
            <p className="text-gray-600">Manage marketplace items and inventory</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-nature-green hover:bg-nature-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mt-4 sm:mt-0"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Item
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($NATUR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price_natur}
                      onChange={(e) => setFormData({...formData, price_natur: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_usd}
                      onChange={(e) => setFormData({...formData, price_usd: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rarity
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    >
                      {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>
                          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_nft"
                      checked={formData.is_nft}
                      onChange={(e) => setFormData({...formData, is_nft: e.target.checked})}
                      className="h-4 w-4 text-nature-green focus:ring-nature-green border-gray-300 rounded"
                    />
                    <label htmlFor="is_nft" className="ml-2 block text-sm text-gray-900">
                      Is NFT
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata (JSON)
                  </label>
                  <textarea
                    rows="4"
                    value={formData.metadata}
                    onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                    placeholder='{"power": "+10 strength", "element": "fire"}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-nature-green hover:bg-nature-green/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rarity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={item.image_url}
                          alt={item.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {item.name}
                            {item.is_nft && (
                              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                NFT
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                        {item.price_natur}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                        item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                        item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                        item.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {item.rarity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No items yet</h3>
              <p className="text-gray-500">Add your first marketplace item to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketplaceAdmin
