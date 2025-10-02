
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

  const { caption, type, page = 1, sortOrder = 'desc', startDate, endDate } = req.query;

  const pageNum = parseInt(page, 10);
  const start = (pageNum - 1) * PAGE_LIMIT;
  const end = start + PAGE_LIMIT - 1;


  let query = supabase
    .from("files")
    .select("*, file_album_links(album_id)", { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: sortOrder === 'asc' })
    .range(start, end);


  if (caption) {
    query = query.ilike("caption", `%${caption}%`);
  }
  
  if (type && type !== 'all') {
    query = query.eq("type", type);
  }

  if (startDate) {
    query = query.gte('created_at', new Date(startDate).toISOString());
  }

  if (endDate) {
    // Add 1 day to the end date to include the whole day
    const to = new Date(endDate);
    to.setDate(to.getDate() + 1);
    query = query.lt('created_at', to.toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({
    files: data,
    total: count,
    hasMore: end < count - 1
  });
}
