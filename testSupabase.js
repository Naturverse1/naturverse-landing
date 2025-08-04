import { supabase } from './supabaseClient.js'

const button = document.querySelector('.test-supabase-button')
if (button) {
  button.addEventListener('click', async () => {
    try {
      const { data, error } = await supabase.from('test_logs').select('*')
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        console.log('Supabase query result:', data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  })
}
