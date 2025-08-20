"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { addMedia } from "@/lib/data";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];

const FormSchema = z.object({
  caption: z.string().max(255, "Caption must be 255 characters or less.").optional(),
  file: z
    .instanceof(File, { message: "File is required." })
    .refine((file) => file.size > 0, "File is required.")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
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

  try {
    // 1. Simulate uploading to Telegram and getting a file_id
    // In a real app: const telegramResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, ...);
    
    // 2. Simulate storing metadata in a database (e.g., Supabase)
    await addMedia({ caption: caption || "", file });

    revalidatePath("/");
    return { message: "File uploaded successfully!", success: true };
  } catch (e) {
    return {
      message: "Database error: Failed to upload file.",
      success: false,
    };
  }
}
