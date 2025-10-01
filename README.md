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

**Important:** For the password reset feature to work, you will also need a `SUPABASE_SERVICE_ROLE_KEY`. You can find this in your Supabase project under **Project Settings > API > Project API keys**. It should be kept secret and only used on the server.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
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
3.  Under **Project API keys**, you will find the **Project URL**, the `anon` `public` key, and the `service_role` secret key.
4.  Copy the **URL** and paste it as the value for `NEXT_PUBLIC_SUPABASE_URL`.
5.  Copy the **anon key** and paste it as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6.  Copy the **service_role key** and paste it as the value for `SUPABASE_SERVICE_ROLE_KEY`.
7.  Paste the **Database Password** you saved during project creation as the value for `SUPABASE_DB_PASSWORD`.

**C. Install Supabase CLI and Apply Migrations:**

To set up your database tables and functions, we'll use the Supabase CLI.

1.  **Install the Supabase CLI:** Follow the official instructions for your operating system: [Install the Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).

2.  **Log in to the CLI:**
    ```bash
    supabase login
    ```

3.  **Link your Project:** Navigate to your project's root directory in the terminal and run the following command. You can find your `[project-id]` in your Supabase project's URL (e.g., `https://app.supabase.com/project/[project-id]`).
    ```bash
    supabase link --project-ref [project-id]
    ```

4.  **Push the Database Migrations:** This command will read the migration files in this repository and apply them to your live Supabase database.
    ```bash
    supabase db push
    ```

**D. Deploy the Edge Function:**

This project uses a Supabase Edge Function for the password reset flow.

1. Set the required secrets for the function. The `service_role` key is needed to perform admin-level actions.
    ```bash
    supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
    ```
   (Replace `...` with the actual values from your `.env.local` file).
   
   **Note:** These secrets are only available to the *deployed* function. For local testing with `supabase functions serve`, you may need to create a `.env` file inside the `supabase/functions/password-reset` directory with the same key-value pairs.

2. Customize the password reset email template in Supabase.
   - Go to **Authentication > Templates** in your Supabase dashboard.
   - Edit the **Invite user** template.
   - Change the content to include the OTP. For example:
     ```html
     <h2>Reset your password</h2>
     <p>Your password reset code is: <strong>{{ .Data.otp_code }}</strong></p>
     <p>This code will expire in 10 minutes.</p>
     ```

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

### 5. Building and Deploying

When you are ready to build your application for production, you can deploy the Edge Function and build the Next.js app with a single command.

```bash
npm run deploy
```

This will first deploy the `password-reset` function to Supabase and then create an optimized production build of your Next.js application in the `.next` folder.
