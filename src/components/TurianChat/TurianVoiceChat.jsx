
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Send } from 'lucide-react';

const TurianVoiceChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Turian, your friendly durian turtle guide! 🐢🍃 You can talk to me by clicking the microphone button, or type your message. What would you like to learn about today?',
      timestamp: new Date()
    }
  ]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUserMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      const reply = data.response || data.message || "I'm sorry, I didn't understand that. Could you try asking in a different way?";

      const assistantMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if not muted
      if (!isMuted) {
        speakMessage(reply);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Oops! I'm having trouble connecting to my brain right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakMessage = (text) => {
    if (!text || isMuted) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';

    // Try to find a friendly voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Female') || voice.name.includes('Google'))
    ) || voices.find(voice => voice.lang.includes('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. You can still type messages!');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const toggleMute = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🐢</div>
            <div>
              <h1 className="text-2xl font-bold">🎤 Talk to Turian</h1>
              <p className="text-green-100">Your friendly AI nature guide</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              onClick={toggleListening}
              disabled={loading}
              className={`p-3 rounded-full transition-colors ${
                listening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-white/20 hover:bg-white/30'
              } disabled:opacity-50`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-lg shadow-lg p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="text-lg">🐢</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="text-lg">👤</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">🐢</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {speaking && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center space-x-2">
                <Volume2 size={12} className="animate-pulse" />
                <span>Turian is speaking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleTextSubmit} className="flex space-x-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !textInput.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>💡 <strong>Tip:</strong> Click the microphone to speak, or type your questions. 
           {listening && <span className="text-red-600 font-semibold"> Listening...</span>}
        </p>
      </div>
    </div>
  );
};

export default TurianVoiceChat;
