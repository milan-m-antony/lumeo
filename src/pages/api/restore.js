import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('files')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Supabase restore error:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ success: true, file: data });

  } catch (error) {
    console.error('Restore operation failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to restore file' });
  }
}
