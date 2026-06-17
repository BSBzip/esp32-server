import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const message = await kv.get('latest') || '';
    if (message) await kv.del('latest');
    return res.status(200).json({ message });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
