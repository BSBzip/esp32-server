import { createClient } from '@supabase/supabase-js';
import { getUser, getRole } from './_auth.js';

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

    const role = await getRole(user.id);
    if (role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const { email, password, newRole } = req.body;
    if (!email || !password || !newRole) return res.status(400).json({ error: 'Email, password and role are required' });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) return res.status(500).json({ error: error.message });

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role: newRole });
    if (roleError) return res.status(500).json({ error: roleError.message });

    return res.status(200).json({ ok: true, email: data.user.email });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
