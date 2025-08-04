import { testSupabase } from './testSupabase.js'
import { signUp, signIn, signOut, signInWithGoogle } from './auth.js'
import { searchContent } from './userFeatures.js'

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('testButton')
  if (button) {
    button.addEventListener('click', testSupabase)
  }

  const emailInput = document.getElementById('email')
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

