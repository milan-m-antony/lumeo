
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch all albums and their file count
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('*, file_album_links(count)')
      .order('created_at', { ascending: false });

    if (albumsError) {
      return res.status(500).json({ error: albumsError.message });
    }

    // For each album, fetch the most recent image to use as a cover
    const albumsWithCovers = await Promise.all(albums.map(async (album) => {
        // Get the file_ids for the current album
        const { data: links, error: linkError } = await supabase
            .from('file_album_links')
            .select('file_id')
            .eq('album_id', album.id)
            .limit(100); // Limit to avoid fetching too many links

        if (linkError || !links || links.length === 0) {
            return { ...album, cover_file_id: null, cover_thumbnail_file_id: null };
        }

        const fileIds = links.map(l => l.file_id);
        
        // Find the most recent photo/video among those files
        const { data: coverFile, error: coverError } = await supabase
            .from('files')
            .select('file_id, thumbnail_file_id')
            .in('id', fileIds)
            .is('deleted_at', null)
            .or('type.eq.photo,type.eq.video')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
      
      return {
        ...album,
        cover_file_id: coverFile?.file_id || null,
        cover_thumbnail_file_id: coverFile?.thumbnail_file_id || null
      };
    }));
    
    // Rename file_album_links to files to match frontend expectations for count
    const finalData = albumsWithCovers.map(a => {
        const { file_album_links, ...rest } = a;
        return {
            ...rest,
            files: [{ count: file_album_links[0]?.count || 0 }]
        };
    });


    return res.status(200).json(finalData);

  } else if (req.method === 'POST') {
    // Create a new album
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Album name is required' });
    }

    const { data, error } = await supabase
      .from('albums')
      .insert([{ name, description: description || '' }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
