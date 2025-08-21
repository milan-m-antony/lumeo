import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { albumId, caption, type } = req.query;

  if (!albumId) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  // First, get all file_ids for the given album_id from the junction table
  const { data: links, error: linkError } = await supabase
    .from('file_album_links')
    .select('file_id')
    .eq('album_id', albumId);

  if (linkError) {
    console.error("Supabase link fetch error:", linkError);
    return res.status(500).json({ error: linkError.message });
  }

  const fileIds = links.map(link => link.file_id);

  if (fileIds.length === 0) {
    return res.json([]); // No files in this album
  }

  // Now, fetch the actual files using the retrieved file_ids
  let query = supabase
    .from("files")
    .select("*, file_album_links!inner(album_id)")
    .in('id', fileIds)
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
    console.error("Supabase file fetch error:", error);
    return res.status(500).json({ error: error.message });
  }
  
  // The result will contain file details along with the album links.
  // We can simplify it if needed, but returning it as is gives more context.
  res.json(data);
}
