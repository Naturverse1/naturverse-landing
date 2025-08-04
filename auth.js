import { supabase } from './supabaseClient.js'
import { saveUserProfile } from './profile.js'

export async function signUpWithPassword({ email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (data?.user) {
    await saveUserProfile(data.user)
  }
  return { data, error }
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (data?.user) {
    await saveUserProfile(data.user)
  }
  return { data, error }
}

