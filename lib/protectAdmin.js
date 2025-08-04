import { supabase } from '../supabaseClient.js'

export async function protectAdmin(router) {
  const { data } = await supabase.auth.getSession()
  const role = data.session?.user?.user_metadata?.role
  if (role !== 'admin') {
    router.push('/')
    return false
  }
  return true
}
