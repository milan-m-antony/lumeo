import { supabase } from './supabase';

export async function validateToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { user: null, error: new Error('Authorization header is missing.') };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, error: new Error('Bearer token is missing.') };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return { user: null, error };
  }

  return { user, error: null };
}
