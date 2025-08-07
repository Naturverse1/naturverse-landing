
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, Minimize2, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const TurianAI = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isQuestMode, setIsQuestMode] = useState(false)
  const [showNftButton, setShowNftButton] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [isMinting, setIsMinting] = useState(false)
  const [navatarMode, setNavatarMode] = useState(false)
  const [navatarStep, setNavatarStep] = useState(0)
  const [navatarData, setNavatarData] = useState({})
  
  const { user } = useAuth()
  const speechSynthesis = useRef(window.speechSynthesis)
  const messagesEndRef = useRef(null)

  const navatarQuestions = [
    "What's your favorite magical fruit? 🍇✨",
    "What color represents your inner magic? 🌈",
    "What outfit would your avatar wear on adventures? 👘",
    "What special powers would you want to have? ⚡"
  ]

  const navatarKeys = ['fruit', 'color', 'outfit', 'powers']

  useEffect(() => {
    if (isOpen && user && !user.isGuest) {
      loadChatHistory()
    }
  }, [isOpen, user])

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  useEffect(() => {
    // Mock wallet connection check
    const checkWallet = () => {
      if (typeof window.ethereum !== 'undefined') {
        setWalletAddress('0x' + Math.random().toString(16).substr(2, 40))
      }
    }
    checkWallet()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatHistory = async () => {
    if (!user || user.isGuest) return
    
    try {
      const response = await fetch(`/api/turian/history/${user.id}`)
      const data = await response.json()
      
      if (response.ok && data.history) {
        const formattedHistory = []
        data.history.forEach(chat => {
          formattedHistory.push({ type: 'user', content: chat.message })
          formattedHistory.push({ type: 'turian', content: chat.reply })
        })
        setConversation(formattedHistory)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const speakText = (text) => {
    if (!voiceEnabled || !speechSynthesis.current) return
    
    speechSynthesis.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a male voice
    const voices = speechSynthesis.current.getVoices()
    const maleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') || 
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('alex')
    )
    
    if (maleVoice) {
      utterance.voice = maleVoice
    }
    
    utterance.rate = 0.9
    utterance.pitch = 0.8
    speechSynthesis.current.speak(utterance)
  }

  const sendMessage = async (customMessage = null) => {
    const userMessage = customMessage || message.trim()
    if (!userMessage) return

    setMessage('')
    setConversation(prev => [...prev, { type: 'user', content: userMessage }])
    setIsLoading(true)

    // Handle navatar mode
    if (navatarMode && navatarStep < navatarQuestions.length) {
      const newNavatarData = { ...navatarData }
      newNavatarData[navatarKeys[navatarStep]] = userMessage
      setNavatarData(newNavatarData)
      
      const nextStep = navatarStep + 1
      setNavatarStep(nextStep)
      
      if (nextStep < navatarQuestions.length) {
        const nextQuestion = `Dee mak! ${navatarQuestions[nextStep]}`
        setConversation(prev => [...prev, { type: 'turian', content: nextQuestion }])
        speakText(nextQuestion)
        setIsLoading(false)
        return
      } else {
        // Save navatar data
        if (user && !user.isGuest) {
          try {
            await fetch('/api/navatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, ...newNavatarData })
            })
          } catch (error) {
            console.error('Failed to save navatar data:', error)
          }
        }
        
        const completionMessage = `Dee mak! Your magical Navatar sounds amazing! A ${newNavatarData.color} ${newNavatarData.fruit} avatar wearing ${newNavatarData.outfit} with ${newNavatarData.powers} powers - absolutely legendary! ✨🐢`
        setConversation(prev => [...prev, { type: 'turian', content: completionMessage }])
        speakText(completionMessage)
        setNavatarMode(false)
        setNavatarStep(0)
        setNavatarData({})
        setIsLoading(false)
        return
      }
    }

    try {
      const chatHistory = user && !user.isGuest ? 
        conversation.slice(-10).reduce((acc, msg, index) => {
          if (msg.type === 'user') {
            const turianReply = conversation[conversation.indexOf(msg) + 1]
            if (turianReply && turianReply.type === 'turian') {
              acc.push({ message: msg.content, reply: turianReply.content })
            }
          }
          return acc
        }, []) : []

      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          userId: user && !user.isGuest ? user.id : null,
          chatHistory
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setConversation(prev => [...prev, { type: 'turian', content: data.message }])
        speakText(data.message)
        
        // Check for quest completion or exciting moments to show NFT button
        if ((data.message.toLowerCase().includes('quest') || 
             data.message.toLowerCase().includes('dee mak') ||
             data.message.toLowerCase().includes('completed')) && 
            walletAddress) {
          setShowNftButton(true)
        }
      } else {
        const errorMsg = 'Oops! I had trouble understanding that. Can you try asking again?'
        setConversation(prev => [...prev, { type: 'turian', content: errorMsg }])
        speakText(errorMsg)
      }
    } catch (error) {
      const errorMsg = 'Sorry, I seem to be having connection troubles right now!'
      setConversation(prev => [...prev, { type: 'turian', content: errorMsg }])
      speakText(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const startQuest = () => {
    setIsQuestMode(true)
    const questPrompt = "Turian, give me a magical quest in the Jungle Trails region! Make it interactive and fun!"
    sendMessage(questPrompt)
  }

  const startNavatarDesign = () => {
    setNavatarMode(true)
    setNavatarStep(0)
    setNavatarData({})
    const navatarPrompt = `Dee mak! Let's design your magical Navatar together! I'll ask you some fun questions. ${navatarQuestions[0]}`
    setConversation(prev => [...prev, { type: 'turian', content: navatarPrompt }])
    speakText(navatarPrompt)
  }

  const mintNft = async () => {
    if (!walletAddress) return
    
    setIsMinting(true)
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress, 
          questType: isQuestMode ? 'Quest' : 'Achievement' 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setConversation(prev => [...prev, { type: 'turian', content: data.message }])
        speakText(data.message)
        setShowNftButton(false)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      const errorMsg = 'Oops! Something went wrong with the NFT minting. Try again later!'
      setConversation(prev => [...prev, { type: 'turian', content: errorMsg }])
      speakText(errorMsg)
    } finally {
      setIsMinting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (voiceEnabled) {
      speechSynthesis.current.cancel()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-nature-green hover:bg-nature-green/90 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 relative"
        >
          <MessageCircle size={24} />
          {voiceEnabled && (
            <div className="absolute -top-1 -right-1 bg-blue-500 w-3 h-3 rounded-full animate-pulse"></div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border-2 border-nature-green w-80 h-96 flex flex-col">
          {/* Header */}
          <div className={`${isQuestMode ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-nature-green'} text-white p-3 rounded-t-lg flex justify-between items-center`}>
            <div className="flex items-center space-x-2">
              <div className="text-xl">🐢</div>
              <div>
                <h3 className="font-bold text-sm flex items-center">
                  Turian the Turtle
                  {isQuestMode && <Sparkles size={14} className="ml-1" />}
                  {navatarMode && <span className="ml-1">🎨</span>}
                </h3>
                <p className="text-xs opacity-90">
                  {isQuestMode ? 'Quest Guide' : navatarMode ? 'Avatar Designer' : 'Your magical learning buddy'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleVoice}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
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
                      : isQuestMode 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 border border-green-200'
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
                <div className={`${isQuestMode ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200' : 'bg-gray-100'} text-gray-800 p-2 rounded-lg text-sm`}>
                  <span className="text-xs">🐢 </span>
                  <span className="animate-pulse">Turian is thinking...</span>
                </div>
              </div>
            )}

            {/* NFT Mint Button */}
            {showNftButton && walletAddress && (
              <div className="flex justify-center">
                <button
                  onClick={mintNft}
                  disabled={isMinting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center space-x-2"
                >
                  <Zap size={16} />
                  <span>{isMinting ? 'Minting...' : 'Mint Stamp NFT'}</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons */}
          {!navatarMode && (
            <div className="px-3 pb-2 flex space-x-2">
              <button
                onClick={startQuest}
                disabled={isLoading || isQuestMode}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <Sparkles size={14} />
                <span>Start Quest</span>
              </button>
              <button
                onClick={startNavatarDesign}
                disabled={isLoading || navatarMode}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
              >
                🎨 Design Navatar
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={navatarMode ? "Share your preference..." : "Ask Turian anything..."}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nature-green"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
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
