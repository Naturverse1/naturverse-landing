
import React, { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { CreditCard, Lock, Loader } from 'lucide-react'

const CheckoutForm = ({ item, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError('')

    const card = elements.getElement(CardElement)

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
          name: 'Naturverse User',
        },
      })

      if (paymentError) {
        throw new Error(paymentError.message)
      }

      // In a real implementation, you would send the payment method to your backend
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate successful payment
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        amount: item.price_usd * 100, // Stripe uses cents
        currency: 'usd',
        payment_method: paymentMethod.id
      }

      if (onSuccess) {
        onSuccess(mockPaymentIntent)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Purchase</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{item.name}</span>
          <span className="font-bold text-lg">${item.price_usd}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="inline h-4 w-4 mr-1" />
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center mb-4 text-sm text-gray-500">
          <Lock className="h-4 w-4 mr-1" />
          Your payment information is secure and encrypted
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-nature-green hover:bg-nature-green/90'
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              `Pay $${item.price_usd}`
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CheckoutForm
