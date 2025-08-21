
"use server";

import { z } from "zod";
import { addMedia } from "@/lib/data";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for Telegram
const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];

const FormSchema = z.object({
  caption: z.string().max(1024, "Caption must be 1024 characters or less.").optional(),
  file: z
    .instanceof(File, { message: "File is required." })
    .refine((file) => file.size > 0, "File is required.")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Max file size is 50MB.`
    )
    .refine(
      (file) => ACCEPTED_MEDIA_TYPES.includes(file.type),
      "Only .jpg, .png, .gif, .mp4, and .webm formats are supported."
    ),
});

export type FormState = {
  message: string;
  errors?: {
    caption?: string[];
    file?: string[];
  };
  success: boolean;
  newMedia?: any;
};

export async function getTelegramFileUrlAction(fileId: string): Promise<string> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("Telegram bot token is not configured.");
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();
    if (!data.ok) {
        throw new Error(`Telegram getFile failed: ${data.description}`);
    }
    const filePath = data.result.file_path;
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
}


export async function uploadFile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
        message: "Server configuration error: Telegram bot token or chat ID is not set. Please check your environment variables.",
        success: false
    }
  }

  const validatedFields = FormSchema.safeParse({
    caption: formData.get("caption"),
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data. Please check the errors.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { file, caption } = validatedFields.data;
  
  const isVideo = file.type.startsWith("video/");
  const telegramApiMethod = isVideo ? "sendVideo" : "sendPhoto";
  const apiUrl = `https://api.telegram.org/bot${token}/${telegramApiMethod}`;

  try {
    const telegramFormData = new FormData();
    telegramFormData.append("chat_id", String(chatId));
    telegramFormData.append(isVideo ? "video" : "photo", file);
    if (caption) {
      telegramFormData.append("caption", caption);
    }
  
    const telegramResponse = await fetch(apiUrl, {
        method: "POST",
        body: telegramFormData,
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
        console.error("Telegram API Error:", telegramResult);
        return { message: `Failed to upload to Telegram: ${telegramResult.description} (Error code: ${telegramResult.error_code})`, success: false };
    }
    
    const message = telegramResult.result;
    const telegramFileId = isVideo ? message.video.file_id : message.photo[message.photo.length - 1].file_id;

    const newDbEntry = await addMedia({ 
        telegram_file_id: telegramFileId, 
        caption: caption || "", 
        type: isVideo ? 'video' : 'photo',
    });

    return { 
        message: "File uploaded successfully!", 
        success: true,
        newMedia: newDbEntry[0] 
    };
  } catch (e) {
    console.error("Upload Action Error:", e);
    const message = e instanceof Error ? e.message : "An unknown error occurred during the upload process."
    return {
      message: `Database or API error: ${message}`,
      success: false,
    };
  }
}
