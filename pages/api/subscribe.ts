import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Only POST requests are allowed' });
  }

  try {
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('New subscription:', { name, email });

    return res.status(200).json({ message: 'Subscription received' });
  } catch (err) {
    console.error('Subscription error:', err);
    return res.status(400).json({ error: 'Invalid request payload' });
  }
}

