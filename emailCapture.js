import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('email-form')
  const messageDiv = document.getElementById('form-message')
  const submitBtn = document.getElementById('submitBtn')
  if (!form || !messageDiv || !submitBtn) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value.trim()
    const name = document.getElementById('name').value.trim()
    const age_group = document.getElementById('age_group').value.trim()
    const interest = document.getElementById('interest').value.trim()
    const message = document.getElementById('message').value.trim()

    if (!name || !email || !age_group) {
      alert('Please fill in your name, email, and age group.')
      return
    }

    submitBtn.disabled = true
    submitBtn.innerText = 'Submitting...'

    let error
    try {
      ;({ error } = await supabase
        .from('early_access_waitlist')
        .insert({ email, name, age_group, interest, message }))
    } catch (e) {
      error = e
    }

    submitBtn.disabled = false
    submitBtn.innerText = 'Join Waitlist'

    if (error) {
      messageDiv.textContent = 'There was an error. Please try again.'
      return
    }

    form.reset()
    messageDiv.textContent = 'Thanks! You\'re on the list.'
    alert("Thanks for joining the waitlist! We'll be in touch soon.")
  })
})
