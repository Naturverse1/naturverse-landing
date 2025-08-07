
import React, { useState } from 'react'
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react'

const TurianAI = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message.trim()
    setMessage('')
    setConversation(prev => [...prev, { type: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setConversation(prev => [...prev, { type: 'turian', content: data.message }])
      } else {
        setConversation(prev => [...prev, { type: 'turian', content: 'Oops! I had trouble understanding that. Can you try asking again?' }])
      }
    } catch (error) {
      setConversation(prev => [...prev, { type: 'turian', content: 'Sorry, I seem to be having connection troubles right now!' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-nature-green hover:bg-nature-green/90 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border-2 border-nature-green w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-nature-green text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-xl">🐢</div>
              <div>
                <h3 className="font-bold text-sm">Turian the Turtle</h3>
                <p className="text-xs opacity-90">Your magical learning buddy</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {conversation.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-2">🐢✨</div>
                <p className="text-sm">Hi there! I'm Turian, your magical turtle guide!</p>
                <p className="text-xs mt-1">Ask me anything about The Naturverse™!</p>
              </div>
            )}
            
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-nature-green text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.type === 'turian' && <span className="text-xs">🐢 </span>}
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                  <span className="text-xs">🐢 </span>
                  <span className="animate-pulse">Turian is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Turian anything..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nature-green"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="bg-nature-green hover:bg-nature-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TurianAI
