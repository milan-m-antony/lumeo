import { supabase } from "../../lib/supabase";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, tg_message_id } = req.body;

  if (!id || !tg_message_id) {
    return res.status(400).json({ error: 'File ID and Telegram Message ID are required' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Server configuration error." });
  }

  try {
    // Step 1: Delete from Supabase first.
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error("Supabase permanent delete error:", dbError);
      throw new Error(dbError.message);
    }

    // Step 2: Delete from Telegram
    const telegramUrl = `https://api.telegram.org/bot${token}/deleteMessage?chat_id=${chatId}&message_id=${tg_message_id}`;
    const tgRes = await fetch(telegramUrl);
    const tgData = await tgRes.json();

    if (!tgData.ok) {
        console.warn(`Could not delete message from Telegram (might be already deleted): ${tgData.description}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Permanent delete operation failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to permanently delete file' });
  }
}
