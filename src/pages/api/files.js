
import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
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
