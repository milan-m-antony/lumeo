import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {

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
