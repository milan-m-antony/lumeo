
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { supabase } from "../../lib/supabase";

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- Environment Variable Validation ---
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !chatId) {
    console.error("Missing Telegram environment variables. Please check your .env.local file.");
    return res.status(500).json({
      error: "Server configuration error: Telegram Bot Token or Channel ID is not set. Please contact the administrator.",
    });
  }
  // -----------------------------------------

  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parse error" });
    }
    
    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || "";
    const file = files.file;
    
    if (!file || file.length === 0) {
      return res.status(400).json({ error: "File is missing." });
    }
    
    const fileInfo = Array.isArray(file) ? file[0] : file;
    const filePath = fileInfo.filepath;
    const fileType = fileInfo.mimetype;

    const tgForm = new FormData();
    tgForm.append("chat_id", chatId);
    tgForm.append("caption", caption);

    let telegramUrl;
    let fileKey;

    if (fileType && fileType.startsWith("image/")) {
      telegramUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
      fileKey = "photo";
    } else {
      telegramUrl = `https://api.telegram.org/bot${token}/sendDocument`;
      fileKey = "document";
    }
    
    tgForm.append(fileKey, fs.createReadStream(filePath));

    const tgRes = await fetch(telegramUrl, { method: "POST", body: tgForm });
    const tgData = await tgRes.json();
    
    fs.unlinkSync(filePath); // Clean up the temporary file

    if (!tgData.ok) {
        console.error("Telegram upload failed:", tgData);
        return res.status(500).json({ error: `Telegram upload failed: ${tgData.description}` });
    }

    const result = tgData.result;
    let fileId;
    let dbFileType;

    if (result.photo) {
      fileId = result.photo[result.photo.length - 1].file_id;
      dbFileType = 'photo';
    } else if (result.document) {
      fileId = result.document.file_id;
      dbFileType = 'document';
    } else {
      console.error("Unrecognized Telegram response:", result);
      return res.status(500).json({ error: "Unrecognized Telegram API response." });
    }

    const messageId = result.message_id;

    const { data, error } = await supabase.from("files").insert([
      {
        file_id: fileId,
        caption,
        type: dbFileType,
        tg_message_id: messageId,
      },
    ]).select();

    if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, file: data[0] });
  });
}
