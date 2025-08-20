import { createClient } from '@supabase/supabase-js'

export type Media = {
  id: string; // Will be the Supabase row ID
  type: "photo" | "video";
  caption: string;
  created_at: Date;
  url?: string; // Optional now, as it will be fetched on the client
  ai_hint?: string;
  telegram_file_id: string;
};

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getBaseMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch media from the database.');
  }
  
  return data.map(item => ({...item, created_at: new Date(item.created_at) })) as Media[];
}


export async function addMedia(item: { telegram_file_id: string; caption: string; type: 'photo' | 'video' }): Promise<any> {
    const { telegram_file_id, caption, type } = item;

    const { data, error } = await supabase
    .from('media')
    .insert([
      { 
        telegram_file_id: telegram_file_id, 
        caption: caption,
        type: type,
        ai_hint: type === 'photo' ? 'abstract art' : 'nature video' // placeholder
      },
    ])
    .select()


  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error('Failed to add media to the database.');
  }

  return data;
}
