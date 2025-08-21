# Lumeo - A Personal Media Gallery

Lumeo is a Next.js application that acts as a personal media gallery, using Telegram for file storage and Supabase for metadata management. It allows you to upload, view, and manage your photos, videos, and documents in a clean, web-based interface.

## Features

-   **Multi-file Type Support:** Upload and manage images, videos, and other documents.
-   **Telegram-based Storage:** Leverages Telegram's robust and generous file storage capabilities.
-   **Supabase Backend:** Uses Supabase for fast and reliable metadata storage and querying.
-   **Responsive Gallery:** A masonry-style gallery for viewing your media.
-   **File Management:** Edit captions and manage your files.
-   **Trash Bin:** Soft-delete files and restore them later, or delete them permanently.

## Getting Started

To get a local copy up and running, follow these simple steps.

### 1. Environment Setup

First, create a new file named `.env.local` in the root of your project. Copy the contents of `.env.example` into this new file:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHANNEL_ID=YOUR_TELEGRAM_CHANNEL_ID
```

You will need to fill in these values by following the Supabase and Telegram setup instructions below.

### 2. Supabase Setup

Supabase will be used to store the metadata for your files, such as captions, file IDs, and timestamps.

**A. Create a Supabase Project:**

1.  Go to [supabase.com](https://supabase.com) and sign in or create a new account.
2.  Click on "**New project**" and give it a name and a secure database password.
3.  Wait for your project to be provisioned.

**B. Get API Keys:**

1.  Once your project is ready, navigate to the **Project Settings** (the gear icon in the left sidebar).
2.  Click on the **API** tab.
3.  Under **Project API keys**, you will find the **Project URL** and the `anon` `public` key.
4.  Copy the **URL** and paste it as the value for `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local` file.
5.  Copy the **anon key** and paste it as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.

**C. Create the `files` Table:**

1.  Go to the **Table Editor** (the table icon in the left sidebar).
2.  Click on "**Create a new table**".
3.  Set the **Table Name** to `files`.
4.  Ensure **Row Level Security (RLS)** is **enabled**.
5.  Add the following columns:
    -   `id` (int8, is identity, is primary key) - This is usually created by default.
    -   `created_at` (timestamptz, default value: `now()`) - Also created by default.
    -   `file_id` (text)
    -   `caption` (text)
    -   `type` (text)
    -   `tg_message_id` (int8)
    -   `thumbnail_file_id` (text, is nullable)
    -   `deleted_at` (timestamptz, is nullable)

**D. Create RLS Policies:**

For the application to work, you need to allow public access to read and write to the `files` table.

1.  Go to **Authentication** -> **Policies**.
2.  Select your `files` table.
3.  Click "**New Policy**" and choose "**Get started from a template**".
4.  Create a policy for **SELECT** operations: Choose "**Enable read access to everyone**". Review and save.
5.  Create a policy for **INSERT** operations: Choose "**Enable insert access for everyone**". Review and save.
6.  Create a policy for **UPDATE** operations: Choose "**Enable update access for everyone**". Review and save.
7.  Create a policy for **DELETE** operations: Choose "**Enable delete access for everyone**". Review and save.

### 3. Telegram Setup

Telegram will be used as the actual file storage backend.

**A. Create a Telegram Bot:**

1.  Open Telegram and search for the **BotFather** (the official bot for managing other bots).
2.  Start a chat and send the `/newbot` command.
3.  Follow the instructions to choose a name and a username for your bot. The username must end in "bot" (e.g., `LumeoGalleryBot`).
4.  BotFather will provide you with a **bot token**. Copy this token and paste it as the value for `TELEGRAM_BOT_TOKEN` in your `.env.local` file.

**B. Create a Public Channel:**

1.  In Telegram, create a new **public channel** (not a private one). The channel's public link will be used to find its ID.
2.  Add your newly created bot to this channel as an **Administrator**. This is crucial, as the bot needs permissions to post and delete messages.

**C. Get the Channel ID:**

1.  The channel ID is its username, prefixed with `@`. For example, if your public channel's link is `t.me/my_lumeo_gallery`, your channel ID is `@my_lumeo_gallery`.
2.  Paste this ID as the value for `TELEGRAM_CHANNEL_ID` in your `.env.local` file.

### 4. Running the Application

Now that your environment is configured, you can run the app.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start by uploading files via the "Upload" link in the sidebar.
