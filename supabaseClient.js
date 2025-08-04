import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.53.0/+esm'

const supabaseUrl = 'https://gxewpstvuoofdqanhjzi.supabase.co'
const supabaseAnonKey = 'sb_publishable_BDdV5w6oEVsrnwBL5f-zhw_Xdjkm7ip'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const button = document.querySelector('.test-supabase-button')
if (button) {
  button.addEventListener('click', async () => {
    const { error } = await supabase.from('test_logs').insert({
      message: 'Hello from the homepage!',
      timestamp: new Date().toISOString()
    })

    if (error) {
      console.error('Error inserting test row:', error)
    } else {
      console.log('Test row inserted successfully')
    }
  })
}
