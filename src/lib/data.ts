import { createClient } from '@supabase/supabase-js'

export type Media = {
  id: string; // Will be the Supabase row ID
  type: "photo" | "video";
  caption: string;
  created_at: Date;
  url: string; // URL from Telegram API
  ai_hint?: string;
  telegram_file_id: string;
};

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const token = process.env.TELEGRAM_BOT_TOKEN!;


const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getTelegramFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();
    if (!data.ok) {
        throw new Error(`Telegram getFile failed: ${data.description}`);
    }
    const filePath = data.result.file_path;
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
}


export async function getMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch media from the database.');
  }

  const mediaWithUrls = await Promise.all(data.map(async (item) => ({
    ...item,
    url: await getTelegramFileUrl(item.telegram_file_id),
    created_at: new Date(item.created_at),
  })));

  return mediaWithUrls as Media[];
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
