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

    const { fileId, albumId, isChecked } = req.body;

    if (!fileId || !albumId) {
        return res.status(400).json({ error: "File ID and Album ID are required." });
    }

    try {
        if (isChecked) {
            // Add a link between the file and the album
            const { error } = await supabase
                .from('file_album_links')
                .insert({ file_id: fileId, album_id: albumId });

            if (error) {
                // Handle potential duplicate key error gracefully
                if (error.code === '23505') { // unique_violation
                   return res.status(200).json({ success: true, message: 'Link already exists.' });
                }
                throw error;
            }
        } else {
            // Remove the link
            const { error } = await supabase
                .from('file_album_links')
                .delete()
                .eq('file_id', fileId)
                .eq('album_id', albumId);

            if (error) throw error;
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("File-Album link operation failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
