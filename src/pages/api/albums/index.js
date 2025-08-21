
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch all albums
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('*, files(count)')
      .order('created_at', { ascending: false });

    if (albumsError) {
      return res.status(500).json({ error: albumsError.message });
    }

    // For each album, fetch the most recent image to use as a cover
    const albumsWithCovers = await Promise.all(albums.map(async (album) => {
      const { data: coverFile, error: coverError } = await supabase
        .from('files')
        .select('file_id, thumbnail_file_id')
        .eq('album_id', album.id)
        .is('deleted_at', null)
        .or('type.eq.photo,type.eq.video') // Prioritize photos/videos for covers
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      return {
        ...album,
        cover_file_id: coverFile?.file_id || null,
        cover_thumbnail_file_id: coverFile?.thumbnail_file_id || null
      };
    }));

    return res.status(200).json(albumsWithCovers);

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
