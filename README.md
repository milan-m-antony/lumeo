# Lumeo - A Personal Media Gallery

Lumeo is a Next.js application that acts as a personal media gallery, using Telegram for file storage and Supabase for metadata management. It allows you to upload, view, and manage your photos, videos, and documents in a clean, web-based interface.

## Features

-   **Album Organization:** Group your files into multiple albums for flexible categorization.
-   **Multi-file Type Support:** Upload and manage images, videos, and other documents.
-   **Telegram-based Storage:** Leverages Telegram's robust and generous file storage capabilities.
-   **Supabase Backend:** Uses Supabase for fast and reliable metadata storage and querying.
-   **Responsive Gallery:** A masonry-style gallery for viewing your media.
-   **File Management:** Edit captions and manage your files across multiple albums.
-   **Trash Bin:** Soft-delete files and restore them later, or delete them permanently.

## Getting Started

To get a local copy up and running, follow these simple steps.

### 1. Environment Setup

First, create a new file named `.env.local` in the root of your project. Copy the contents of the example below into this new file. You will fill in the values in the next steps.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_DB_PASSWORD=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
```

### 2. Supabase Setup

Supabase will be used to store the metadata for your files, such as captions, file IDs, and timestamps.

**A. Create a Supabase Project:**

1.  Go to [supabase.com](https://supabase.com) and sign in or create a new account.
2.  Click on "**New project**" and give it a name.
3.  Save the **Database Password** that you create. You will need it for your `.env.local` file.
4.  Wait for your project to be provisioned.

**B. Get Supabase Credentials:**

1.  Once your project is ready, navigate to the **Project Settings** (the gear icon in the left sidebar).
2.  Click on the **API** tab.
3.  Under **Project API keys**, you will find the **Project URL** and the `anon` `public` key.
4.  Copy the **URL** and paste it as the value for `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local` file.
5.  Copy the **anon key** and paste it as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.
6.  Paste the **Database Password** you saved during project creation as the value for `SUPABASE_DB_PASSWORD`.

**C. Install Supabase CLI and Apply Migrations:**

To set up your database tables and functions, we'll use the Supabase CLI. It's a more reliable method than running SQL manually.

1.  **Install the Supabase CLI:** Follow the official instructions for your operating system: [Install the Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).

2.  **Log in to the CLI:**
    ```bash
    supabase login
    ```

3.  **Link your Project:** Navigate to your project's root directory in the terminal and run the following command. You can find your `[project-id]` in your Supabase project's URL (e.g., `https://app.supabase.com/project/[project-id]`).
    ```bash
    supabase link --project-ref [project-id]
    ```

4.  **Push the Database Migrations:** This command will read the migration file in this repository and apply it to your live Supabase database.
    ```bash
    supabase db push
    ```

Your database is now set up!

### 3. Telegram Setup

Telegram will be used as the actual file storage backend.

**A. Create a Telegram Bot:**

1.  Open Telegram and search for the **BotFather** (the official bot for managing other bots).
2.  Start a chat and send the `/newbot` command.
3.  Follow the instructions to choose a name and a username for your bot. The username must end in "bot" (e.g., `LumeoGalleryBot`).
4.  BotFather will provide you with a **bot token**. Copy this token and paste it as the value for `TELEGRAM_BOT_TOKEN` in your `.env.local` file.

**B. Create a Public Channel:**

1.  In Telegram, create a new **public channel** (not a private one). The channel's public link is used to find its ID.
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start by creating an account and then uploading files via the "Upload" link in the sidebar.
