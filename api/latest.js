import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('messages')
      .select('id, message')
      .eq('delivered', false)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(200).json({ message: '' });

    await supabase.from('messages').update({ delivered: true }).eq('id', data[0].id);

    return res.status(200).json({ message: data[0].message });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
