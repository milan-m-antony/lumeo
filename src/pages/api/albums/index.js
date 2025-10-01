import { getSupabaseWithAuth } from "../../../lib/supabase";
import { validateToken } from "../../../lib/auth";

export default async function handler(req, res) {
  const { error: tokenError } = await validateToken(req);
  if (tokenError) {
    return res.status(401).json({ error: tokenError.message });
  }

  const token = req.headers.authorization.split(' ')[1];
  const supabase = getSupabaseWithAuth(token);

  if (req.method === 'GET') {
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('*, file_album_links(count)')
      .order('created_at', { ascending: false });

    if (albumsError) {
      return res.status(500).json({ error: albumsError.message });
    }

    const albumsWithCovers = await Promise.all(albums.map(async (album) => {
        const { data: links, error: linkError } = await supabase
            .from('file_album_links')
            .select('file_id')
            .eq('album_id', album.id)
            .limit(100); 

        if (linkError || !links || links.length === 0) {
            return { ...album, cover_file_id: null, cover_thumbnail_file_id: null };
        }

        const fileIds = links.map(l => l.file_id);
        
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
    
    const finalData = albumsWithCovers.map(a => {
        const { file_album_links, ...rest } = a;
        return {
            ...rest,
            files: [{ count: file_album_links[0]?.count || 0 }]
        };
    });

    return res.status(200).json(finalData);

  } else if (req.method === 'POST') {
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
