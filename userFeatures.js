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

export async function sendNotification(userId, title, message, type = 'info') {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, message, type, is_read: false })
  return { error }
}

export async function markNotificationAsRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  return { error }
}

export async function submitFeedback(message, rating) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }
  const { error } = await supabase
    .from('feedback')
    .insert({ user_id: user.id, message, rating })
  return { error }
}

export async function loadModulesByRegion(region) {
  const { data, error } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('region', region)
  const modules = data
    ? data.map((m) => ({ ...m, hasQuiz: !!m.quiz_id }))
    : []
  return { data: modules, error }
}

export async function loadDashboard(userId) {
  const [
    { data: avatarData, error: avatarError },
    { data: stampData, error: stampError },
    { data: quizData, error: quizError },
    { data: notificationData, error: notificationError },
  ] = await Promise.all([
    supabase.from('users').select('avatar_url').eq('id', userId).single(),
    supabase.from('stamps').select('*').eq('user_id', userId),
    supabase
      .from('user_quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false),
  ])
  return {
    avatar: avatarData ? avatarData.avatar_url : null,
    stamps: stampData || [],
    quizAttempts: quizData || [],
    notifications: notificationData || [],
    errors: [avatarError, stampError, quizError, notificationError].filter(
      Boolean
    ),
  }
}
