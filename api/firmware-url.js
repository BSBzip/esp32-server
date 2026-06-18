import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('firmware')
        .select('url, note')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(200).json({ url: '' });

      const { data: signed, error: signError } = await supabase.storage
        .from('firmware')
        .createSignedUrl(data[0].url, 3600);

      if (signError) return res.status(500).json({ error: signError.message });

      return res.status(200).json({ url: signed.signedUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
