import { getSupabaseWithAuth } from "../../lib/supabase";
import { validateToken } from "../../lib/auth";

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { error: tokenError } = await validateToken(req);
    if (tokenError) {
        return res.status(401).json({ error: tokenError.message });
    }

    const token = req.headers.authorization.split(' ')[1];
    const supabase = getSupabaseWithAuth(token);

    try {
        // 1. Calculate Telegram Storage from our DB
        const { data: tgData, error: tgError } = await supabase
            .from('files')
            .select('file_size');

        if (tgError) {
            console.error("Error fetching file sizes:", tgError);
            throw new Error(`Error fetching Telegram file sizes: ${tgError.message}`);
        }

        const totalTgSize = tgData.reduce((acc, file) => acc + (file.file_size || 0), 0);

        // 2. Get Supabase DB size
        const { data: dbData, error: dbError } = await supabase
            .rpc('get_database_size');

        if (dbError) {
            console.error("Error fetching database size:", dbError);
            if (dbError.code === '42501') { 
                 return res.status(200).json({
                    telegram: {
                        bytes: totalTgSize,
                        pretty: formatBytes(totalTgSize)
                    },
                    supabase: {
                        bytes: 0,
                        pretty: "DB size requires elevated permissions"
                    }
                });
            }
            throw new Error(`Error fetching Supabase DB size: ${dbError.message}`);
        }
        
        res.status(200).json({
            telegram: {
                bytes: totalTgSize,
                pretty: formatBytes(totalTgSize)
            },
            supabase: {
                bytes: dbData,
                pretty: formatBytes(dbData)
            }
        });

    } catch (error) {
        console.error("Storage Summary Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch storage summary." });
    }
}
