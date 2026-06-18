import { createClient } from '@supabase/supabase-js';
import { getUser, getRole } from './_auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const role = await getRole(user.id);
    if (role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });

    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = {};
    (roles || []).forEach(r => roleMap[r.user_id] = r.role);

    const list = users.map(u => ({
      id:         u.id,
      email:      u.email,
      role:       roleMap[u.id] || 'none',
      created_at: u.created_at
    }));

    return res.status(200).json({ users: list });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
