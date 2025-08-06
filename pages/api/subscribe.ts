import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase credentials are missing')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS for cross-domain requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' })
  }

  try {
    const { email, interests } = req.body as {
      email?: string
      interests?: string | string[]
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    const { data: existing, error: existingError } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingError) {
      console.error('Supabase select error:', existingError)
      return res.status(500).json({ error: existingError.message })
    }

    if (existing) {
      return res.status(200).json({ message: 'Email already subscribed' })
    }

    const { error: insertError } = await supabase.from('subscribers').insert({
      email,
      interests: interests || null,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({ message: 'Subscription received' })
  } catch (err) {
    console.error('Subscription error:', err)
    return res.status(400).json({ error: 'Invalid request payload' })
  }
}

