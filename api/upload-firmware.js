import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-note');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const note     = req.headers['x-note'] || '';
      const filename = `firmware-${Date.now()}.bin`;
      const body     = await readBody(req);

      const { error: uploadError } = await supabase.storage
        .from('firmware')
        .upload(filename, body, { contentType: 'application/octet-stream' });

      if (uploadError) return res.status(500).json({ error: uploadError.message });

      const { error: dbError } = await supabase
        .from('firmware')
        .insert({ url: filename, note });

      if (dbError) return res.status(500).json({ error: dbError.message });

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
