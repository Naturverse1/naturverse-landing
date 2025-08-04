import { supabase } from './supabaseClient.js'

async function saveProfile(user) {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)

  if (fetchError) {
    return fetchError
  }

  if (existingProfile.length === 0) {
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
      username: user.user_metadata?.username,
    })
    return insertError
  }

  return null
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
  let profileError = null
  if (!error && data.user) {
    profileError = await saveProfile(data.user)
  }
  return { user: data.user, error: error || profileError }
}

export async function signOut() {
  await supabase.auth.signOut()
}

