
import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";
import fetch from "node-fetch";

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

    const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!tgBotToken || !chatId) {
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        // 1. Get all trashed files to delete from Telegram
        const { data: filesToDelete, error: fetchError } = await supabase
            .from('files')
            .select('tg_message_id')
            .not('deleted_at', 'is', null);
        
        if (fetchError) {
            console.error("Supabase fetch for empty trash error:", fetchError);
            throw new Error(fetchError.message);
        }

        // 2. Attempt to delete each message from Telegram
        for (const file of filesToDelete) {
            if (file.tg_message_id) {
                const telegramUrl = `https://api.telegram.org/bot${tgBotToken}/deleteMessage?chat_id=${chatId}&message_id=${file.tg_message_id}`;
                fetch(telegramUrl).then(async (tgRes) => {
                    if (!tgRes.ok) {
                        const tgData = await tgRes.json();
                        console.warn(`Could not delete message ${file.tg_message_id} from Telegram (might be already deleted): ${tgData.description}`);
                    }
                }).catch(e => console.error(`Error deleting message from Telegram: ${e.message}`));
            }
        }

        // 3. Permanently delete all trashed files from Supabase DB
        const { error: dbError } = await supabase
            .from('files')
            .delete()
            .not('deleted_at', 'is', null);
        
        if (dbError) {
            console.error("Supabase empty trash delete error:", dbError);
            throw new Error(dbError.message);
        }
        
        res.status(200).json({ success: true, message: `${filesToDelete.length} files permanently deleted.` });

    } catch (error) {
        console.error('Empty trash operation failed:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to empty trash' });
    }
}
