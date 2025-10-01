import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";

const PAGE_LIMIT = 50;

export default async function handler(req, res) {
  const { error: tokenError } = await validateToken(req);
  if (tokenError) {
    return res.status(401).json({ error: tokenError.message });
  }

  const token = req.headers.authorization.split(' ')[1];
  const supabase = getSupabaseWithAuth(token);

  const { albumId, caption, type, page = 1 } = req.query;

  if (!albumId) {
    return res.status(400).json({ error: "Album ID is required" });
  }

  const pageNum = parseInt(page, 10);
  const startRange = (pageNum - 1) * PAGE_LIMIT;
  const endRange = startRange + PAGE_LIMIT - 1;

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
    return res.json({ files: [], total: 0, hasMore: false });
  }

  let query = supabase
    .from("files")
    .select("*, file_album_links!inner(album_id)", { count: 'exact' })
    .in('id', fileIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(startRange, endRange);

  if (caption) {
    query = query.ilike("caption", `%${caption}%`);
  }
  
  if (type && type !== 'all') {
    query = query.eq("type", type);
  }

  const { data, error, count } = await query;
  
  if (error) {
    console.error("Supabase file fetch error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({
    files: data,
    total: count,
    hasMore: endRange < count - 1
  });
}
