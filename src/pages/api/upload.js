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
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parse error" });
    }
    
    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || "";
    const file = files.file;
    
    if (!file) {
      return res.status(400).json({ error: "File is missing." });
    }
    
    const fileInfo = Array.isArray(file) ? file[0] : file;
    const filePath = fileInfo.filepath;
    const fileType = fileInfo.mimetype;

    const tgForm = new FormData();
    tgForm.append("chat_id", process.env.TELEGRAM_CHANNEL_ID);
    tgForm.append("caption", caption);

    let telegramUrl;
    let fileKey;

    // Check if the file is an image and use the appropriate API
    if (fileType && fileType.startsWith("image/")) {
      telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`;
      fileKey = "photo";
    } else {
      telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`;
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

    // Extract file_id based on the type of media sent
    const result = tgData.result;
    let fileId;
    let dbFileType;

    if (result.photo) {
      // For photos, Telegram returns an array of different sizes, we take the largest one
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

    // Save metadata in Supabase
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
