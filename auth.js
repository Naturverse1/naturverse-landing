import { supabase } from './supabaseClient.js'

export async function saveUserProfile(user) {
  const { id, email, user_metadata } = user
  const { error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      is_admin: user_metadata?.is_admin || false,
    })
  if (error) {
    console.error('Error saving user profile:', error)
  } else {
    console.log('User profile saved')
  }
  return { error }
}

export async function getUserProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError) {
    console.error('Error getting current user:', authError)
    return null
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  return data
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (!error && data.user) {
    await saveUserProfile(data.user)
  }
  return { user: data.user, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (!error && data.user) {
    await saveUserProfile(data.user)
  }
  return { user: data.user, error }
}

export async function signOut() {
  sessionStorage.removeItem('guest_user')
  await supabase.auth.signOut()
}

export async function signInAsGuest() {
  const id = crypto.randomUUID()
  const guestUser = {
    id,
    username: `Guest-${Math.floor(Math.random() * 9000) + 1000}`,
    avatar_url: 'https://placehold.co/100x100',
    isGuest: true,
  }
  const { error } = await supabase.from('users').upsert({
    id,
    username: guestUser.username,
    avatar_url: guestUser.avatar_url,
    is_guest: true,
  })
  if (error) console.error('Error creating guest user:', error)
  sessionStorage.setItem('guest_user', JSON.stringify(guestUser))
  return guestUser
}

export function getGuestUser() {
  const stored = sessionStorage.getItem('guest_user')
  return stored ? JSON.parse(stored) : null
}

