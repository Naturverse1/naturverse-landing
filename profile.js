import { supabase } from './supabaseClient.js'

export async function saveUserProfile(user) {
  const username = user.email ? user.email.split('@')[0] : null
  const avatar_url = user.user_metadata?.avatar_url || null

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    username,
    avatar_url
  })

  if (error) {
    console.error('Error saving user profile:', error)
  }
}

