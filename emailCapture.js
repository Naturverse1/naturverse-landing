import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('email-form-container')
  const form = document.getElementById('email-form')
  const messageDiv = document.getElementById('form-message')
  const successMessage = document.getElementById('success-message')
  const submitBtn = document.getElementById('submitBtn')
  if (!form || !messageDiv || !submitBtn || !formContainer || !successMessage) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value.trim()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$
    if (!email || !emailPattern.test(email)) {
      messageDiv.textContent = 'Please enter a valid email.'
      return
    }

    submitBtn.disabled = true
    submitBtn.innerText = 'Submitting...'

    let error
    try {
      ;({ error } = await supabase
        .from('email_captures')
        .insert({ email }))
    } catch (e) {
      error = e
    }

    submitBtn.disabled = false
    submitBtn.innerText = 'Join Waitlist'

    if (error) {
      console.error(error)
      messageDiv.textContent = 'Something went wrong.'
      return
    }

    form.reset()
    formContainer.style.display = 'none'
    successMessage.style.display = 'block'
  })
})
