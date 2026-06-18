import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { id, name } = req.body;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing device id' });

    const now = new Date().toISOString();

    const { error: insertErr } = await supabase.from('devices').insert({
      id,
      name: name || ('ESP32-' + id.slice(-4)),
      last_seen: now,
      created_at: now
    });

    if (insertErr) {
      if (insertErr.code === '23505') {
        await supabase.from('devices').update({ last_seen: now }).eq('id', id);
      } else {
        return res.status(500).json({ error: insertErr.message });
      }
    }

    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
