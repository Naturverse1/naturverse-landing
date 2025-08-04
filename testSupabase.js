import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gxewpstvuoofdqanhjzi.supabase.co'
const supabaseKey = 'sb_publishable_BDdV5w6oEVsrnwBL5f-zhw_Xdjkm7ip'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
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

testSupabase()

