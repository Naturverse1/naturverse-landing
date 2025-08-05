import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('email-form')
  const messageDiv = document.getElementById('form-message')
  if (!form || !messageDiv) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const emailInput = form.querySelector('#email')
    const email = emailInput.value.trim()

    if (!email) {
      messageDiv.textContent = 'Please enter your email.'
      return
    }

    const { error } = await supabase.from('early_access_waitlist').insert({ email })

    if (error) {
      messageDiv.textContent = 'There was an error. Please try again.'
      return
    }

    form.reset()
    messageDiv.textContent = 'Thanks! You\'re on the list.'
  })
})
