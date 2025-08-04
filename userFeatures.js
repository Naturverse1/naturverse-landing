import { supabase } from './supabaseClient.js'

export async function uploadAvatar(file) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const filePath = `${user.id}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)
  if (uploadError) {
    return { error: uploadError }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  return { publicUrl, error: updateError }
}

export async function saveNavatar({ name, category, appearance_data, image_url }) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const { error } = await supabase.from('avatars').insert({
    user_id: user.id,
    name,
    category,
    appearance_data,
    image_url,
  })

  return { error }
}

export async function submitQuizAttempt(quizId, responses) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const score = Array.isArray(responses)
    ? responses.reduce((total, r) => total + (r.correct ? 1 : 0), 0)
    : 0

  const { error } = await supabase.from('user_quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    responses,
    score,
  })

  return { score, error }
}

export async function awardStamp(region, stamp_name) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const { data: existing, error: selectError } = await supabase
    .from('stamps')
    .select('*')
    .eq('user_id', user.id)
    .eq('stamp_name', stamp_name)

  if (selectError) {
    return { error: selectError }
  }
  if (existing && existing.length > 0) {
    return { data: existing[0], alreadyAwarded: true }
  }

  const { data, error } = await supabase
    .from('stamps')
    .insert({ user_id: user.id, region, stamp_name })
    .select()

  return { data: data ? data[0] : null, error }
}
