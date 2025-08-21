import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Fetch a single album
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
        return res.status(404).json({ error: "Album not found" });
    }
    return res.status(200).json(data);
  } else if (req.method === 'PUT') {
    // Update an album
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Album name is required' });
    }

    const { data, error } = await supabase
      .from('albums')
      .update({ name, description: description || '' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } else if (req.method === 'DELETE') {
    // Delete an album
    // Note: This only deletes the album record. Files within the album are not deleted
    // but their album_id will be set to NULL due to the ON DELETE SET NULL constraint.
    const { data, error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: "Album deleted successfully." });

  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
