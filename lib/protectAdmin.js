import { supabase } from '../supabaseClient.js'

export async function protectAdmin(router) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    router.push('/')
    return false
  }
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (error || !data?.is_admin) {
    router.push('/')
    return false
  }
  return true
}
