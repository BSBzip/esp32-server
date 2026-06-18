import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: false },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-note');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const note     = req.headers['x-note'] || '';
    const filename = `firmware-${Date.now()}.bin`;

    const blob = await put(filename, req, {
      access: 'public',
      contentType: 'application/octet-stream',
    });

    const { error } = await supabase.from('firmware').insert({ url: blob.url, note });
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ url: blob.url });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
