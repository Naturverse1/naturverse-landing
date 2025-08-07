
import React, { useState } from 'react'
import { Coins, Star, Zap, CreditCard, Gem, Package } from 'lucide-react'
import CheckoutForm from './CheckoutForm'
import { mintNFT } from '../utils/nftMint'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MarketplaceItemCard = ({ item, onPurchaseSuccess }) => {
  const [showCheckout, setShowCheckout] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [mintingNFT, setMintingNFT] = useState(false)
  const { user } = useAuth()

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
      'Avatars': Star,
      'Accessories': Star,
      'Power-Ups': Zap,
      'Stamps': Package,
      'NFT Collectibles': Gem
    }
    const IconComponent = icons[category] || Package
    return <IconComponent className="h-4 w-4" />
  }

  const handlePaymentSuccess = async (paymentIntent) => {
    setPurchasing(true)
    
    try {
      // Record the purchase in Supabase
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
          quantity: 1,
          total_cost: item.price_usd,
          payment_method: 'stripe',
          payment_intent_id: paymentIntent.id,
          transaction_hash: paymentIntent.id
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

      // If it's an NFT, mint it
      if (item.is_nft) {
        setMintingNFT(true)
        
        try {
          // Get user's wallet address
          if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const walletAddress = await signer.getAddress()

            // Create metadata URI
            const metadata = {
              name: item.name,
              description: item.description,
              image: item.image_url,
              attributes: Object.entries(item.metadata || {}).map(([trait_type, value]) => ({
                trait_type,
                value
              })),
              rarity: item.rarity
            }

            // In a real implementation, you'd upload this to IPFS
            const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

            const nftResult = await mintNFT(walletAddress, metadataURI)

            // Update the purchase record with NFT details
            await supabase
              .from('user_purchases')
              .update({
                nft_token_id: nftResult.tokenId,
                nft_transaction_hash: nftResult.transactionHash
              })
              .eq('payment_intent_id', paymentIntent.id)

            alert(`🎉 NFT minted successfully! Token ID: ${nftResult.tokenId}`)
          }
        } catch (nftError) {
          console.error('NFT minting failed:', nftError)
          alert('Item purchased successfully, but NFT minting failed. Please contact support.')
        } finally {
          setMintingNFT(false)
        }
      }

      // Update item stock
      await supabase
        .from('market_items')
        .update({ stock: item.stock - 1 })
        .eq('id', item.id)

      setShowCheckout(false)
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess(item)
      }

      alert(`✅ Successfully purchased ${item.name}! Check your inventory.`)
    } catch (error) {
      console.error('Purchase processing error:', error)
      alert('Purchase failed. Please try again or contact support.')
    } finally {
      setPurchasing(false)
    }
  }

  if (showCheckout) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="relative">
          <CheckoutForm
            item={item}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 marketplace-card">
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
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold rarity-glow">
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

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            {item.price_natur > 0 && (
              <div className="flex items-center text-yellow-600">
                <Coins className="h-4 w-4 mr-1" />
                <span className="font-bold">{item.price_natur} $NATUR</span>
              </div>
            )}
            {item.price_usd > 0 && (
              <div className="flex items-center text-green-600">
                <CreditCard className="h-4 w-4 mr-1" />
                <span className="font-bold">${item.price_usd} USD</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Stock: {item.stock}
          </div>
        </div>

        {/* Purchase Options */}
        <div className="space-y-2">
          {item.price_natur > 0 && (
            <button
              disabled={item.stock === 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                item.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy with $NATUR
            </button>
          )}
          
          {item.price_usd > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              disabled={item.stock === 0 || purchasing || mintingNFT}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                item.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : purchasing || mintingNFT
                  ? 'bg-nature-green/50 text-white cursor-not-allowed'
                  : 'bg-nature-green hover:bg-nature-green/90 text-white'
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {purchasing
                ? 'Processing...'
                : mintingNFT
                ? 'Minting NFT...'
                : item.stock === 0
                ? 'Out of Stock'
                : `Buy for $${item.price_usd}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketplaceItemCard
