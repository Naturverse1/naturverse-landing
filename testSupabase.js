import { supabase } from './supabaseClient.js'

export async function testSupabase() {
  const { data, error } = await supabase.from('test_logs').select('*')

  if (error) {
    console.error('Supabase error:', error)
  } else {
    console.log('Supabase query result:', data)
    data.forEach((row) => {
      console.log('Message:', row.message)
    })
  }
}

