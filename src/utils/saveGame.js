
import { supabase } from '../lib/supabase'

export async function saveGameState(userId, data) {
  const { error } = await supabase
    .from('user_state')
    .upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error saving game state:', error)
    return { error }
  }
  
  return { success: true }
}

export async function loadGameState(userId) {
  const { data, error } = await supabase
    .from('user_state')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error loading game state:', error)
    return null
  }
  
  return data
}

export async function saveNavatar(userId, navatarData) {
  return await saveGameState(userId, { navatar_data: navatarData })
}

export async function saveQuest(userId, questData) {
  return await saveGameState(userId, { current_quest: questData })
}

export async function saveRegion(userId, region) {
  return await saveGameState(userId, { region })
}

export async function saveTurianMemory(userId, memory) {
  return await saveGameState(userId, { turian_memory: memory })
}
