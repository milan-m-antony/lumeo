// This is a mock database. In a real application, you would use a service like Supabase.

export type Media = {
  id: string;
  type: "photo" | "video";
  caption: string;
  timestamp: Date;
  url: string;
  aiHint?: string;
  telegramFileId: string;
};

// In-memory store
let mediaStore: Media[] = [
  { id: '1', type: 'photo', caption: 'Serene mountain lake at dawn', timestamp: new Date(Date.now() - 1000 * 60 * 5), url: 'https://placehold.co/600x400.png', aiHint: 'mountain lake', telegramFileId: 'fake_id_1' },
  { id: '2', type: 'photo', caption: 'Vibrant city skyline at night', timestamp: new Date(Date.now() - 1000 * 60 * 15), url: 'https://placehold.co/400x600.png', aiHint: 'city night', telegramFileId: 'fake_id_2' },
  { id: '3', type: 'photo', caption: 'A majestic lion in the savannah', timestamp: new Date(Date.now() - 1000 * 60 * 30), url: 'https://placehold.co/600x400.png', aiHint: 'lion savannah', telegramFileId: 'fake_id_3' },
  { id: '4', type: 'video', caption: 'Ocean waves crashing on the shore', timestamp: new Date(Date.now() - 1000 * 60 * 45), url: 'https://placehold.co/600x400.png', aiHint: 'ocean waves', telegramFileId: 'fake_id_4' },
  { id: '5', type: 'photo', caption: 'Modern architectural marvel', timestamp: new Date(Date.now() - 1000 * 60 * 60), url: 'https://placehold.co/400x600.png', aiHint: 'modern architecture', telegramFileId: 'fake_id_5' },
  { id: '6', type: 'photo', caption: 'Cozy cabin in a snowy forest', timestamp: new Date(Date.now() - 1000 * 60 * 90), url: 'https://placehold.co/600x400.png', aiHint: 'snowy forest', telegramFileId: 'fake_id_6' },
];

// Simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getMedia(): Promise<Media[]> {
  await sleep(50); // Simulate DB query time
  return [...mediaStore].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function addMedia(item: { caption: string; file: File }): Promise<Media> {
  await sleep(500); // Simulate upload and DB insertion time
  
  const type = item.file.type.startsWith("image/") ? "photo" : "video";
  const newId = crypto.randomUUID();

  const newMedia: Media = {
    id: newId,
    telegramFileId: `fake_telegram_id_${newId}`,
    caption: item.caption,
    type,
    timestamp: new Date(),
    url: `https://placehold.co/600x${type === 'photo' ? 400 + Math.floor(Math.random() * 200) : 400}.png`,
    aiHint: type === 'photo' ? "abstract art" : "nature video"
  };

  mediaStore.unshift(newMedia);
  return newMedia;
}
