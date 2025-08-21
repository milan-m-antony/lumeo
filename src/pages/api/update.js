import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, caption, album_id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  const updateData = {};
  if (caption !== undefined) {
    updateData.caption = caption || ""; // Allow empty caption
  }
  if (album_id !== undefined) {
    // If album_id is 'none', set it to null, otherwise use the provided id
    updateData.album_id = album_id === 'none' ? null : album_id;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No update data provided.' });
  }

  const { data, error } = await supabase
    .from('files')
    .update(updateData)
    .eq('id', id)
    .select()
    .single(); // .single() is important to get the updated object back

  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
      return res.status(404).json({ error: 'File not found' });
  }

  res.status(200).json({ success: true, file: data });
}
