import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Only POST requests are allowed' })
  }

  try {
    const { email, interests } = req.body as {
      email?: string
      interests?: string[]
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    if (interests && !Array.isArray(interests)) {
      return res
        .status(400)
        .json({ error: 'Interests must be an array of strings' })
    }

    const { error } = await supabaseAdmin.from('subscribers').insert({
      email,
      interests: interests || [],
      subscribed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: 'Failed to save subscription' })
    }

    return res.status(200).json({ message: 'Subscription received' })
  } catch (err) {
    console.error('Subscription error:', err)
    return res.status(400).json({ error: 'Invalid request payload' })
  }
}

