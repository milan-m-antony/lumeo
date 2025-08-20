"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { addMedia, getTelegramFileUrl as getFileUrl } from "@/lib/data";

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
};

export async function uploadFile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
        message: "Server configuration error: Telegram bot token or chat ID is missing.",
        success: false
    }
  }

  const isVideo = file.type.startsWith("video/");
  const telegramApiMethod = isVideo ? "sendVideo" : "sendPhoto";
  const apiUrl = `https://api.telegram.org/bot${token}/${telegramApiMethod}`;

  // Reconstruct FormData inside the server action
  const telegramFormData = new FormData();
  telegramFormData.append("chat_id", chatId);
  telegramFormData.append(isVideo ? "video" : "photo", file, file.name);
  if (caption) {
    telegramFormData.append("caption", caption);
  }

  try {
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

    await addMedia({ 
        telegram_file_id: telegramFileId, 
        caption: caption || "", 
        type: isVideo ? 'video' : 'photo',
    });

    revalidatePath("/");
    return { message: "File uploaded successfully!", success: true };
  } catch (e) {
    console.error("Upload Action Error:", e);
    const message = e instanceof Error ? e.message : "An unknown error occurred during the upload process."
    return {
      message: `Database or API error: ${message}`,
      success: false,
    };
  }
}

export async function getTelegramFileUrl(fileId: string) {
    return getFileUrl(fileId);
}
