import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";

export default async function handler(req, res) {

  const { error: tokenError } = await validateToken(req);
  if (tokenError) {
    return res.status(401).json({ error: tokenError.message });
  }

  const token = req.headers.authorization.split(' ')[1];
  const supabase = getSupabaseWithAuth(token);

  let query = supabase
    .from("files")
    .select("*")
    .not('deleted_at', 'is', null) // Only fetch files that are in the trash
    .order('deleted_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("Supabase fetch trashed files error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}
