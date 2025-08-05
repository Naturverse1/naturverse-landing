export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }
  const { email, options } = req.body || {};
  console.log('Received subscription data:', { email, options });
  return res.status(200).json({ message: 'Subscription received', email, options });
}
