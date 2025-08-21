import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { file_id } = req.query;

    if (!file_id) {
        return res.status(400).json({ error: 'File ID is required' });
    }

    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        
        // Step 1: Get the file_path from Telegram
        const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
        const getFileData = await getFileRes.json();

        if (!getFileData.ok) {
            console.error("Telegram getFile error:", getFileData);
            return res.status(404).json({ error: 'File not found on Telegram', details: getFileData.description });
        }

        const filePath = getFileData.result.file_path;

        // Step 2: Construct the download URL and fetch the file content
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

        // Redirect the user's browser to the actual file URL to trigger download/display
        res.redirect(302, fileUrl);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
}
