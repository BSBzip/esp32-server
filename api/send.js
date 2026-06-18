import { createClient } from '@supabase/supabase-js';
import { getUser } from './_auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { message } = req.body;
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'No message provided' });
    if (message.length > 200) return res.status(400).json({ error: 'Message too long (max 200 chars)' });

    const { error } = await supabase.from('messages').insert({ message });
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
