import { createClient } from '@supabase/supabase-js';
import { getUser } from './_auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('devices')
      .select('id, name, last_seen')
      .order('last_seen', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ devices: data || [] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
