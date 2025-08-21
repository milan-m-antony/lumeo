import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // This endpoint now only handles updating the caption.
  // Album linking is handled by /api/file-album-link.js
  const { id, caption } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  if (caption === undefined) {
      return res.status(400).json({ error: 'No caption data provided.' });
  }

  const { data, error } = await supabase
    .from('files')
    .update({ caption: caption || "" }) // Allow empty caption
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
      return res.status(404).json({ error: 'File not found' });
  }

  res.status(200).json({ success: true, file: data });
}
