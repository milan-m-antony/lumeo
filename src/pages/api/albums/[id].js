import { supabase, getSupabaseWithAuth } from "../../../lib/supabase";
import { validateToken } from "../../../lib/auth";

export default async function handler(req, res) {
    const { error: tokenError } = await validateToken(req);
    if (tokenError) {
        return res.status(401).json({ error: tokenError.message });
    }
    const token = req.headers.authorization.split(' ')[1];
    const supabaseAuthed = getSupabaseWithAuth(token);

    const { id } = req.query;

    if (req.method === 'GET') {
        const { data, error } = await supabaseAuthed
            .from('albums')
            .select('*, file_album_links(count)')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (!data) {
            return res.status(404).json({ error: "Album not found" });
        }
        
        const { file_album_links, ...rest } = data;
        const finalData = {
            ...rest,
            files: [{ count: file_album_links[0]?.count || 0 }]
        };

        return res.status(200).json(finalData);
    } else if (req.method === 'PUT') {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Album name is required' });
        }

        const { data, error } = await supabaseAuthed
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
        const { error } = await supabaseAuthed
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
