import { supabase } from './supabaseClient.js'

export async function testSupabase() {
  const { data, error } = await supabase.from('test_logs').select('*')
  const resultDiv = document.getElementById('result')

  if (error) {
    console.error('Supabase error:', error)
    if (resultDiv) {
      resultDiv.innerText = `Error: ${error.message}`
    }
  } else {
    console.log('Supabase query result:', data)
    data.forEach((row) => {
      console.log('Message:', row.message)
    })
    if (resultDiv) {
      resultDiv.innerText = data.map((row) => row.message).join('\n')
    }
  }
}

