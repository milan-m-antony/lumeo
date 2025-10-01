import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { error: tokenError } = await validateToken(req);
  if (tokenError) {
    return res.status(401).json({ error: tokenError.message });
  }

  const token = req.headers.authorization.split(' ')[1];
  const supabase = getSupabaseWithAuth(token);

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Supabase soft delete error:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ success: true, file: data });

  } catch (error) {
    console.error('Soft delete operation failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to move file to trash' });
  }
}
