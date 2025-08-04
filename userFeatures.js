import { supabase } from './supabaseClient.js'

export async function logActivity(userId, type, message) {
  await supabase
    .from('activity_feed')
    .insert({ user_id: userId, type, message })
}

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

export async function submitQuizAttempt(
  quizId,
  responses,
  { quizTitle, region, threshold = 70 } = {}
) {
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
  const totalQuestions = Array.isArray(responses) ? responses.length : 0
  const percentage = totalQuestions ? (score / totalQuestions) * 100 : 0

  const { error } = await supabase.from('user_quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    responses,
    score,
  })

  await logActivity(user.id, 'quiz', `Completed quiz ${quizTitle || quizId}`)

  if (percentage >= threshold && region) {
    const { alreadyAwarded } = await awardStamp(region)
    if (!alreadyAwarded) {
      await sendNotification(
        user.id,
        'Stamp Earned!',
        `You earned a new stamp for completing a quiz in ${region}`,
        'success'
      )
    }
  }

  return { score, percentage, error }
}

export async function getUserStamps(userId) {
  const { data, error } = await supabase
    .from('stamps')
    .select('*')
    .eq('user_id', userId)
  return { data: data || [], error }
}

export async function createLearningModule(module) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (profileError || !profile.is_admin) {
    return { error: profileError || new Error('Unauthorized') }
  }

  const { data, error } = await supabase
    .from('learning_modules')
    .insert({ ...module, created_by: user.id })
    .select()
    .single()

  return { data, error }
}

export async function updateLearningModule(moduleId, updates) {
  const { data, error } = await supabase
    .from('learning_modules')
    .update(updates)
    .eq('id', moduleId)
    .select()
    .single()
  return { data, error }
}

export async function deleteLearningModule(moduleId) {
  const { error } = await supabase
    .from('learning_modules')
    .delete()
    .eq('id', moduleId)
  return { error }
}

export async function updateQuiz(quizId, updates) {
  const { data, error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', quizId)
    .select()
    .single()
  return { data, error }
}

export async function deleteQuiz(quizId) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)
  return { error }
}

export async function updateProfile({ username, avatar_url }) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: authError || new Error('No authenticated user') }
  }

  const updates = {}
  if (username !== undefined) updates.username = username
  if (avatar_url !== undefined) updates.avatar_url = avatar_url

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
  return { error }
}

export async function awardStamp(region, stamp_name = `${region} Starter Stamp`) {
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
    .eq('region', region)

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

  await logActivity(user.id, 'stamp', `Earned stamp ${stamp_name}`)

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
  if (!error) {
    await logActivity(user.id, 'feedback', 'Submitted feedback')
  }
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

export async function searchContent(searchTerm) {
  const [moduleRes, quizRes] = await Promise.all([
    supabase
      .from('learning_modules')
      .select('*')
      .textSearch('title', searchTerm),
    supabase.from('quizzes').select('*').textSearch('title', searchTerm),
  ])

  return {
    modules: moduleRes.data || [],
    quizzes: quizRes.data || [],
    errors: [moduleRes.error, quizRes.error].filter(Boolean),
  }
}

export async function loadDashboard(userId) {
  const [
    { data: avatarData, error: avatarError },
    { data: stampData, error: stampError },
    { data: quizData, error: quizError },
    { data: notificationData, error: notificationError },
    { data: activityData, error: activityError },
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
    supabase
      .from('activity_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])
  return {
    avatar: avatarData ? avatarData.avatar_url : null,
    stamps: stampData || [],
    quizAttempts: quizData || [],
    notifications: notificationData || [],
    activity: activityData || [],
    errors: [
      avatarError,
      stampError,
      quizError,
      notificationError,
      activityError,
    ].filter(Boolean),
  }
}
