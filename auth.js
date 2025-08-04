import { supabase } from './supabaseClient.js'

async function saveProfile(user) {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
  })
  return error
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  let profileError = null
  if (!error && data.user) {
    profileError = await saveProfile(data.user)
  }
  return { user: data.user, error: error || profileError }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

