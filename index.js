import { testSupabase } from './testSupabase.js'
import { signUp, signIn, signOut, getUserProfile } from './auth.js'

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
})

