import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { error } = await supabase
      .from('email_signups')
      .insert([{ name, email }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ message: 'Subscription received' });
  } catch (err) {
    console.error('Subscription error:', err);
    return res.status(500).json({ error: 'Unable to process subscription' });
  }
}

