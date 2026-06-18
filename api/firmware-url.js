import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('firmware')
      .select('url, note, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });

    const row = data?.[0];
    return res.status(200).json({
      url:  row?.url  || '',
      note: row?.note || '',
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
