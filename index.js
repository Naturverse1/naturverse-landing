import { testSupabase } from './testSupabase.js'
import { signUp, signIn, signOut, signInWithGoogle } from './auth.js'
import { searchContent } from './userFeatures.js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Handle Turian AI POST requests
if (typeof window === 'undefined') {
  const express = require('express')
  const app = express()
  
  app.use(express.json())
  app.use(express.static('.'))
  
  app.post('/api/turian', async (req, res) => {
    try {
      const { message, userId, chatHistory } = req.body
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: 'OpenAI API key not configured. Turian needs his magical powers!' })
      }
      
      // Build conversation context with history
      const messages = [
        {
          role: "system",
          content: `You are Turian, a magical durian turtle from The Naturverse™, a friendly big brother who guides kids through educational adventures with encouragement, nature wisdom, and fun. Use the catchphrase "Dee mak!" when something is correct or exciting.`
        }
      ]
      
      // Add chat history for context
      if (chatHistory && chatHistory.length > 0) {
        chatHistory.forEach(chat => {
          messages.push({ role: "user", content: chat.message })
          messages.push({ role: "assistant", content: chat.reply })
        })
      }
      
      messages.push({ role: "user", content: message })
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        max_tokens: 200
      })
      
      const reply = completion.choices[0].message.content
      
      // Save to Supabase if user is authenticated
      if (userId) {
        try {
          const { createClient } = require('@supabase/supabase-js')
          const supabase = createClient(
            process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
            process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
          )
          
          await supabase.from('turian_chats').insert({
            user_id: userId,
            message,
            reply
          })
        } catch (dbError) {
          console.error('Database error:', dbError)
        }
      }
      
      res.json({ message: reply })
    } catch (error) {
      console.error('OpenAI API error:', error)
      res.status(500).json({ message: 'Something went wrong talking to Turian.' })
    }
  })
  
  app.get('/api/turian/history/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('turian_chats')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      res.json({ history: data.reverse() })
    } catch (error) {
      console.error('History fetch error:', error)
      res.status(500).json({ message: 'Failed to fetch chat history' })
    }
  })
  
  app.post('/api/navatar', async (req, res) => {
    try {
      const { userId, responses } = req.body
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('navatar_data')
        .upsert({
          user_id: userId,
          responses,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      res.json({ success: true, data })
    } catch (error) {
      console.error('Navatar save error:', error)
      res.status(500).json({ message: 'Failed to save navatar data' })
    }
  })
  
  app.post('/api/mint', async (req, res) => {
    try {
      const { walletAddress, questType } = req.body
      
      // Mock NFT minting response - replace with actual smart contract interaction
      const mockNftId = Math.floor(Math.random() * 10000)
      
      // Simulate blockchain interaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      res.json({ 
        success: true, 
        nftId: mockNftId,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        message: `Dee mak! Your ${questType} stamp NFT has been minted!`
      })
    } catch (error) {
      console.error('NFT minting error:', error)
      res.status(500).json({ message: 'Failed to mint NFT stamp' })
    }
  })
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Turian API server running on port ${PORT}`)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('testButton')
  if (button) {
    button.addEventListener('click', testSupabase)
  }

  const emailInput = document.getElementById('auth-email')
  const passwordInput = document.getElementById('password')
  const resultText = document.getElementById('authResult')

  const signupButton = document.getElementById('signupButton')
  const loginButton = document.getElementById('loginButton')
  const googleButton = document.getElementById('googleLoginButton')
  const logoutButton = document.getElementById('logoutButton')

  signupButton.onclick = async () => {
    signupButton.disabled = true
    signupButton.textContent = 'Submitting...'
    const { error } = await signUp(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      signupButton.disabled = false
      signupButton.textContent = 'Sign Up'
      return
    }
    window.location.href = '/'
  }

  loginButton.onclick = async () => {
    loginButton.disabled = true
    loginButton.textContent = 'Submitting...'
    const { error } = await signIn(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      loginButton.disabled = false
      loginButton.textContent = 'Log In'
      return
    }
    window.location.href = '/'
  }

  googleButton.onclick = async () => {
    googleButton.disabled = true
    googleButton.textContent = 'Redirecting...'
    await signInWithGoogle()
  }

  logoutButton.onclick = async () => {
    logoutButton.disabled = true
    await signOut()
    resultText.textContent = 'Logged out'
    logoutButton.disabled = false
  }

  const searchInput = document.getElementById('globalSearch')
  const searchButton = document.getElementById('searchButton')
  const searchResults = document.getElementById('searchResults')
  if (searchButton && searchInput && searchResults) {
    searchButton.addEventListener('click', async () => {
      const term = searchInput.value
      const { modules, quizzes, errors } = await searchContent(term)
      if (errors.length) {
        searchResults.textContent = errors[0].message
        return
      }
      const modList = modules.map((m) => `Module: ${m.title}`).join('<br>')
      const quizList = quizzes.map((q) => `Quiz: ${q.title}`).join('<br>')
      searchResults.innerHTML = [modList, quizList].filter(Boolean).join('<br>')
    })
  }
})

