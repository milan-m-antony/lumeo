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

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHANNEL_ID?.trim();

  if (!token || !chatId) {
    console.error("Missing Telegram environment variables.");
    return res.status(500).json({
      error: "Server configuration error: Telegram Bot Token or Channel ID is not set.",
    });
  }

  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    let filePath;
    try {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Form parse error" });
      }
      
      const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || "";
      const albumId = Array.isArray(fields.albumId) ? fields.albumId[0] : fields.albumId;
      const file = files.file;
      
      if (!file || file.length === 0) {
        return res.status(400).json({ error: "File is missing." });
      }
      
      const fileInfo = Array.isArray(file) ? file[0] : file;
      filePath = fileInfo.filepath;
      const fileType = fileInfo.mimetype || "";

      const tgForm = new FormData();
      tgForm.append("chat_id", chatId);
      tgForm.append("caption", caption);

      let telegramUrl;
      let fileKey;
      let dbFileType;

      if (fileType.startsWith("image/")) {
        telegramUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
        fileKey = "photo";
        dbFileType = 'photo';
      } else if (fileType.startsWith("video/")) {
        telegramUrl = `https://api.telegram.org/bot${token}/sendVideo`;
        fileKey = "video";
        dbFileType = 'video';
      } else {
        telegramUrl = `https://api.telegram.org/bot${token}/sendDocument`;
        fileKey = "document";
        dbFileType = 'document';
      }
      
      tgForm.append(fileKey, fs.createReadStream(filePath));

      const tgRes = await fetch(telegramUrl, { method: "POST", body: tgForm });
      const tgData = await tgRes.json();
      
      if (!tgData.ok) {
          console.error("Telegram upload failed. Full response:", JSON.stringify(tgData, null, 2));
          return res.status(500).json({ error: `Telegram upload failed: ${tgData.description}` });
      }

      const result = tgData.result;
      let fileId;
      let thumbnailFileId = null;

      if (result.photo) {
        fileId = result.photo[result.photo.length - 1].file_id;
      } else if (result.video) {
        fileId = result.video.file_id;
        if (result.video.thumbnail) {
            thumbnailFileId = result.video.thumbnail.file_id;
        }
      } else if (result.document) {
        fileId = result.document.file_id;
      } else {
        console.error("Unrecognized Telegram response:", result);
        return res.status(500).json({ error: "Unrecognized Telegram API response." });
      }

      const messageId = result.message_id;

      const dbData = {
        file_id: fileId,
        caption,
        type: dbFileType,
        tg_message_id: messageId,
        thumbnail_file_id: thumbnailFileId,
      };

      if (albumId && albumId !== 'none') {
        dbData.album_id = parseInt(albumId, 10);
      }

      const { data, error } = await supabase.from("files").insert([dbData]).select().single();

      if (error) {
          console.error("Supabase insert error:", error);
          // Attempt to delete the just-uploaded message from Telegram if DB insert fails
          await fetch(`https://api.telegram.org/bot${token}/deleteMessage?chat_id=${chatId}&message_id=${messageId}`);
          return res.status(500).json({ error: `Database insert failed: ${error.message}` });
      }

      res.json({ success: true, file: data });

    } catch (error) {
        console.error("An unexpected error occurred in the upload handler:", error);
        res.status(500).json({ error: "An unexpected server error occurred." });
    } finally {
        if (filePath) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
            });
        }
    }
  });
}
