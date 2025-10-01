import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";

export default async function handler(req, res) {
  const { error: tokenError } = await validateToken(req);
  if (tokenError) {
    return res.status(401).json({ error: tokenError.message });
  }

  const token = req.headers.authorization.split(' ')[1];
  const supabase = getSupabaseWithAuth(token);

  const { caption, type } = req.query;

  let query = supabase
    .from("files")
    .select("*, file_album_links(album_id)") // Also fetch the album links
    .is('deleted_at', null) // Only fetch files that are not in the trash
    .order('created_at', { ascending: false });

  if (caption) {
    query = query.ilike("caption", `%${caption}%`);
  }
  
  if (type && type !== 'all') {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase fetch error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}
