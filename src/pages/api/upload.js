
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

  const form = formidable({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Form parse error" });
      }
      
      const captions = Array.isArray(fields.captions) ? fields.captions : [fields.captions || ""];
      let albumIds = fields.albumIds ? (Array.isArray(fields.albumIds) ? fields.albumIds : [fields.albumIds]) : [];
      albumIds = albumIds.filter(id => id && id !== 'none');

      const uploadedFiles = files.files;
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No files were uploaded." });
      }
      
      const results = [];
      const uploadedFileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

      for (const [index, fileInfo] of uploadedFileArray.entries()) {
        let filePath = fileInfo.filepath;
        try {
          const fileType = fileInfo.mimetype || "";
          const caption = captions[index] || "";

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
              console.error(`Telegram upload failed for ${fileInfo.originalFilename}. Full response:`, JSON.stringify(tgData, null, 2));
              results.push({
                  filename: fileInfo.originalFilename,
                  success: false,
                  error: `Telegram upload failed: ${tgData.description}`
              });
              continue;
          }

          const result = tgData.result;
          let fileId;
          let thumbnailFileId = null;
          let fileSize = 0;

          if (result.photo) {
            const bestPhoto = result.photo[result.photo.length - 1];
            fileId = bestPhoto.file_id;
            fileSize = bestPhoto.file_size || 0;
          } else if (result.video) {
            fileId = result.video.file_id;
            fileSize = result.video.file_size || 0;
            if (result.video.thumbnail) {
                thumbnailFileId = result.video.thumbnail.file_id;
            }
          } else if (result.document) {
            fileId = result.document.file_id;
            fileSize = result.document.file_size || 0;
          } else {
            console.error("Unrecognized Telegram response:", result);
            results.push({
                filename: fileInfo.originalFilename,
                success: false,
                error: "Unrecognized Telegram API response."
            });
            continue;
          }

          const messageId = result.message_id;

          const dbData = {
            file_id: fileId,
            caption,
            type: dbFileType,
            tg_message_id: messageId,
            thumbnail_file_id: thumbnailFileId,
            file_size: fileSize,
          };

          const { data: insertedFile, error } = await supabase.from("files").insert([dbData]).select().single();

          if (error) {
              console.error("Supabase insert error:", error);
              await fetch(`https://api.telegram.org/bot${token}/deleteMessage?chat_id=${chatId}&message_id=${messageId}`);
              results.push({
                  filename: fileInfo.originalFilename,
                  success: false,
                  error: `Database insert failed: ${error.message}`
              });
              continue;
          }

          if (albumIds.length > 0) {
            const links = albumIds.map(albumId => ({
                file_id: insertedFile.id,
                album_id: parseInt(albumId, 10),
            }));

            const { error: linkError } = await supabase.from('file_album_links').insert(links);

            if (linkError) {
                 console.error("Supabase link insert error:", linkError);
                 results.push({
                    filename: fileInfo.originalFilename,
                    success: true,
                    file: insertedFile,
                    warning: `File uploaded but failed to link to albums: ${linkError.message}`
                 });
                 continue;
            }
          }

          results.push({
            filename: fileInfo.originalFilename,
            success: true,
            file: insertedFile
          });

        } catch (uploadError) {
          console.error(`An error occurred while uploading ${fileInfo.originalFilename}:`, uploadError);
           results.push({
                filename: fileInfo.originalFilename,
                success: false,
                error: "An unexpected error occurred during upload."
            });
        } finally {
            if (filePath) {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
                });
            }
        }
      }
      
      const successfulUploads = results.filter(r => r.success);
      if (successfulUploads.length === 0) {
          return res.status(500).json({
              error: 'All file uploads failed.',
              details: results
          });
      }

      res.json({
        success: true,
        message: `Processed ${uploadedFileArray.length} files. ${successfulUploads.length} succeeded.`,
        results: results
      });

    } catch (globalError) {
        console.error("An unexpected error occurred in the upload handler:", globalError);
        res.status(500).json({ error: "An unexpected server error occurred." });
    }
  });
}
