
import React, { useEffect, useState } from 'react'
import { Package, Calendar, Star, Crown, Zap, Trophy, Gem } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MyInventory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { user } = useAuth()

  useEffect(() => {
    if (user && !user.isGuest) {
      fetchInventory()
    }
  }, [user])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          market_items (
            name,
            category,
            image_url,
            price_natur,
            price_usd,
            is_nft,
            metadata,
            rarity,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('acquired_date', { ascending: false })

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('❌ Inventory fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Avatars': Crown,
      'Accessories': Star,
      'Power-Ups': Zap,
      'Stamps': Trophy,
      'NFT Collectibles': Gem
    }
    const IconComponent = icons[category] || Package
    return <IconComponent className="h-5 w-5" />
  }

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      uncommon: 'text-green-600 bg-green-100',
      rare: 'text-blue-600 bg-blue-100',
      legendary: 'text-purple-600 bg-purple-100',
      cosmic: 'text-pink-600 bg-pink-100'
    }
    return colors[rarity] || colors.common
  }

  const categories = ['All', ...new Set(items.map(item => item.market_items?.category).filter(Boolean))]
  
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.market_items?.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your inventory...</p>
        </div>
      </div>
    )
  }

  if (!user || user.isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Sign in Required</h3>
          <p className="text-gray-500">Please sign in to view your inventory.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <Package className="mr-3 h-10 w-10 text-nature-green" />
            My Inventory
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage all your collected items, power-ups, and NFT collectibles!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-nature-green">{items.length}</div>
            <div className="text-gray-600">Total Items</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {items.filter(item => item.market_items?.is_nft).length}
            </div>
            <div className="text-gray-600">NFTs</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter(item => item.market_items?.rarity === 'legendary' || item.market_items?.rarity === 'cosmic').length}
            </div>
            <div className="text-gray-600">Rare Items</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{categories.length - 1}</div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-nature-green text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((inventoryItem) => {
              const item = inventoryItem.market_items
              if (!item) return null

              return (
                <div key={inventoryItem.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Item Image */}
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                    {item.is_nft && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          NFT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      {getCategoryIcon(item.category)}
                      <span className="ml-2 text-sm text-gray-500">{item.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                    {/* Metadata */}
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 capitalize">{key}:</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity and Date */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        Qty: {inventoryItem.quantity}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(inventoryItem.acquired_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedCategory === 'All' ? 'No items in inventory' : `No ${selectedCategory} items`}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === 'All' 
                ? 'Visit the marketplace to get your first items!'
                : 'Try selecting a different category or visit the marketplace.'
              }
            </p>
            <button
              onClick={() => window.location.href = '/marketplace'}
              className="bg-nature-green hover:bg-nature-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Visit Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyInventory
