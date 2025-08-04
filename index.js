import { testSupabase } from './testSupabase.js'
import { signUp, signIn, signOut, getUserProfile } from './auth.js'
import { searchContent } from './userFeatures.js'

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('testButton')
  if (button) {
    button.addEventListener('click', testSupabase)
  }

  const emailInput = document.getElementById('email')
  const passwordInput = document.getElementById('password')
  const resultText = document.getElementById('authResult')

  document.getElementById('signupButton').onclick = async () => {
    const { user, error } = await signUp(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      return
    }
    const profile = await getUserProfile()
    resultText.textContent = profile
      ? `Signed up as ${profile.email}`
      : `Signed up as ${user.email}`
  }

  document.getElementById('loginButton').onclick = async () => {
    const { user, error } = await signIn(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      return
    }
    const profile = await getUserProfile()
    resultText.textContent = profile
      ? `Logged in as ${profile.email}`
      : `Logged in as ${user.email}`
  }

  document.getElementById('logoutButton').onclick = async () => {
    await signOut()
    resultText.textContent = 'Logged out'
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

