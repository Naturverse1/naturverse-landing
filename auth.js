import { supabase } from './supabaseClient.js'

export async function saveUserProfile(user) {
  const { id, email } = user
  const { error } = await supabase.from('users').upsert({ id, email })
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
  await supabase.auth.signOut()
}

