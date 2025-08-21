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
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
    
    if (!filePath) {
        return res.status(400).json({ error: "File is missing." });
    }

    // Send to Telegram
    const tgForm = new FormData();
    tgForm.append("chat_id", process.env.TELEGRAM_CHANNEL_ID);
    tgForm.append("document", fs.createReadStream(filePath));
    tgForm.append("caption", caption);

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`,
      { method: "POST", body: tgForm }
    );
    const tgData = await tgRes.json();
    
    // Clean up the temporary file
    fs.unlinkSync(filePath);

    if (!tgData.ok) {
        console.error("Telegram upload failed:", tgData);
        return res.status(500).json({ error: "Telegram upload failed" });
    }

    const fileId = tgData.result.document.file_id;
    const messageId = tgData.result.message_id;

    // Save metadata in Supabase
    const { data, error } = await supabase.from("files").insert([
      {
        file_id: fileId,
        caption,
        type: "document",
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
