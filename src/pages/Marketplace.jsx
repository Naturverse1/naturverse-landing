
import React, { useState, useEffect } from 'react'
import { ShoppingCart, Coins, Star, Package, Zap, Crown, Trophy, Gem, Filter, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import MarketplaceItemCard from '../components/MarketplaceItemCard'

const Marketplace = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadMarketItems()
    if (user && !user.isGuest) {
      loadUserBalance()
      checkWalletConnection()
    }
  }, [user])

  useEffect(() => {
    filterItems()
  }, [items, selectedCategory, searchTerm])

  const loadMarketItems = async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
      const uniqueCategories = ['All', ...new Set(data?.map(item => item.category) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading market items:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('natur_rewards')
        .select('amount')
        .eq('user_id', user.id)

      if (error) throw error

      const total = data?.reduce((sum, reward) => sum + reward.amount, 0) || 0
      setUserBalance(total)
    } catch (error) {
      console.error('Error loading user balance:', error)
    }
  }

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        setWalletConnected(accounts.length > 0)
      } catch (error) {
        console.error('Error checking wallet:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use the marketplace!')
      return
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletConnected(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const filterItems = () => {
    let filtered = items

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
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

  const purchaseItem = async (item) => {
    if (!user || user.isGuest) {
      alert('Please sign in to make purchases!')
      return
    }

    if (!walletConnected) {
      alert('Please connect your wallet first!')
      return
    }

    if (userBalance < item.price_natur) {
      alert(`Insufficient $NATUR tokens! You need ${item.price_natur} but have ${userBalance}.`)
      return
    }

    setPurchasing(item.id)

    try {
      // Simulate blockchain transaction for $NATUR token transfer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const walletAddress = await signer.getAddress()

      // In a real implementation, you would call a smart contract
      // For now, we'll simulate with a mock transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

      // Record the purchase
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
          quantity: 1,
          total_cost: item.price_natur,
          transaction_hash: mockTxHash
        })

      if (purchaseError) throw purchaseError

      // Add to user inventory
      const { error: inventoryError } = await supabase
        .from('user_inventory')
        .insert({
          user_id: user.id,
          item_id: item.id,
          quantity: 1
        })

      if (inventoryError) throw inventoryError

      // Deduct $NATUR tokens
      const { error: deductError } = await supabase
        .from('natur_rewards')
        .insert({
          user_id: user.id,
          type: 'marketplace_purchase',
          amount: -item.price_natur,
          description: `Purchased ${item.name}`
        })

      if (deductError) throw deductError

      // Update item stock
      const { error: stockError } = await supabase
        .from('market_items')
        .update({ stock: item.stock - 1 })
        .eq('id', item.id)

      if (stockError) throw stockError

      // Update local state
      setUserBalance(userBalance - item.price_natur)
      setItems(items.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i))

      alert(`Successfully purchased ${item.name}! Check your inventory.`)
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
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
            <ShoppingCart className="mr-3 h-10 w-10 text-nature-green" />
            Naturverse Marketplace
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover magical items, power-ups, and exclusive NFT collectibles to enhance your Naturverse adventure!
          </p>
        </div>

        {/* User Balance & Wallet */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Coins className="h-6 w-6 text-yellow-500 mr-2" />
            <span className="text-lg font-semibold text-gray-800">
              Balance: {userBalance} $NATUR
            </span>
          </div>
          
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="bg-nature-green hover:bg-nature-green/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Wallet Connected
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MarketplaceItemCard
              key={item.id}
              item={item}
              onPurchaseSuccess={() => {
                loadMarketItems()
                loadUserBalance()
              }}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace
