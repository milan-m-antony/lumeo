import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { albumId, caption, type } = req.query;

  if (!albumId) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  let query = supabase
    .from("files")
    .select("*")
    .eq('album_id', albumId)
    .is('deleted_at', null)
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
