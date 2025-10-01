import { supabase } from '@/lib/supabase';

// This is a simplified admin client for a one-off check.
// In a real-world multi-tenant app, you'd use a more secure service role key on the server.
const supabaseAdmin = supabase

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // This is not a recommended way to query users in a production app with RLS enabled for users table.
    // We are using this approach because we don't have access to service_role key to bypass RLS.
    // This is a hacky way to get user count without enabling read access to auth.users table.
    const { data, error } = await supabaseAdmin.rpc('get_users_count');

    if (error) {
        // Fallback for when the RPC function doesn't exist.
        if (error.code === '42883') {
             const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
             if(userError) throw userError;
             return res.status(200).json({ count: users.length });
        }
        throw error;
    }

    res.status(200).json({ count: data });
  } catch (error) {
    console.error('Error fetching user count:', error);
    // If we can't determine the user count, we should probably prevent signups for security.
    // Returning a count of 1 ensures the form is hidden.
    res.status(500).json({ count: 1, error: 'Could not verify user status.' });
  }
}
