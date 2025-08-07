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
  
  app.post('/api/turian', async (req, res) => {
    try {
      const { message } = req.body
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are Turian the magical durian turtle, a playful big brother in a fantasy learning world called The Naturverse™."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150
      })
      
      res.json({ message: completion.choices[0].message.content })
    } catch (error) {
      console.error('OpenAI API error:', error)
      res.status(500).json({ error: 'Failed to get response from Turian' })
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

