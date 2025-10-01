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

### 1. Install Dependencies

First, install the necessary packages, including the Supabase CLI.

```bash
npm install
```

### 2. Supabase Project Setup

Supabase will be used to store the metadata for your files, such as captions, file IDs, and timestamps.

**A. Create a Supabase Project:**

1.  Go to [supabase.com](https://supabase.com) and sign in or create a new account.
2.  Click on "**New project**" and give it a name.
3.  Save the **Database Password** that you create. You will need it in the next step.
4.  Wait for your project to be provisioned.

**B. Create `.env.local` File:**

Create a new file named `.env.local` in the root of your project. Copy the contents of the example below into this new file and fill in the values from your Supabase project.

-   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in **Project Settings > API > Project API keys**.
-   `SUPABASE_SERVICE_ROLE_KEY` is also in **Project Settings > API** but you must click "Show" and enter your password to reveal it. This key must be kept secret.
-   `SUPABASE_DB_PASSWORD` is the database password you saved during project creation.
-   `TELEGRAM_...` keys need to be filled in with your own Telegram bot credentials.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
```

### 3. Link Supabase and Push Schema

Now, we will connect your local project to your Supabase project in the cloud and set up the database.

**A. Log in to Supabase:**

Run this command. It will open a browser window asking you to authorize the application.

```bash
npm run supabase:login
```

**B. Link your Project:**

Run the following command. It will ask you to select your Supabase organization and project. You will also be asked for your database password.

```bash
npm run supabase:link
```

**C. Push the Database Migrations:**

This command will read the migration files in this repository and apply them to your live Supabase database, creating all the necessary tables and security policies.

```bash
npm run supabase:db push
```

### 4. Deploy the Edge Function

This project uses a Supabase Edge Function for the password reset flow.

**A. Set the Function Secrets:**

The function needs access to your project URL and service key to perform admin actions. Run this command, replacing the placeholders with your actual credentials from your `.env.local` file.

```bash
npm run supabase:secrets:set -- SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

**B. Customize the Password Reset Email:**

Supabase will send an email with the OTP. You need to edit the email template to show it.
   - Go to **Authentication > Templates** in your Supabase dashboard.
   - Edit the **Reset password** template.
   - Change the content to the following HTML to provide a professional-looking email with the required reset code.
     ```html
     <!DOCTYPE html>
     <html>
       <head>
         <meta charset="utf-8" />
         <style>
           body {
             font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
             background: #f3f4f6;
             margin: 0;
             padding: 0;
           }
           .container {
             max-width: 520px;
             margin: 40px auto;
             background: #ffffff;
             border-radius: 16px;
             padding: 40px 30px;
             box-shadow: 0 8px 24px rgba(0,0,0,0.08);
           }
           .logo {
             text-align: center;
             font-size: 26px;
             font-weight: 700;
             color: #3b82f6;
             margin-bottom: 10px;
             letter-spacing: 1px;
           }
           h2 {
             font-size: 20px;
             text-align: center;
             color: #1f2937;
             margin-bottom: 15px;
           }
           p {
             color: #4b5563;
             font-size: 15px;
             line-height: 1.6;
             text-align: center;
             margin: 12px 0;
           }
           .code-box {
             background: linear-gradient(135deg, #6366f1, #3b82f6);
             border-radius: 12px;
             padding: 18px;
             text-align: center;
             font-size: 26px;
             font-weight: 700;
             letter-spacing: 4px;
             color: #ffffff;
             margin: 25px auto;
             width: fit-content;
           }
           .footer {
             text-align: center;
             font-size: 12px;
             color: #9ca3af;
             margin-top: 40px;
           }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="logo">Lumeo</div>
           <h2>Reset your password</h2>
           <p>Hello,</p>
           <p>We received a request to reset your Lumeo account password.</p>
     
           <div class="code-box">
             {{ .Token }}
           </div>
     
           <p>This code will expire in <strong>10 minutes</strong>.</p>
           <p>If you didn’t request this, you can safely ignore this email.</p>
     
           <div class="footer">
             © 2025 Lumeo · Secure Authentication  
           </div>
         </div>
       </body>
     </html>
     ```

**C. Deploy the Function:**

Now, run the deployment command from your terminal:
```bash
npm run supabase:functions:deploy -- password-reset
```
After a moment, you should see "Deployed function 'password-reset' to project". You can verify this by going to the **Edge Functions** section in your Supabase dashboard.

### 5. Running the Application

Now that your environment is configured, you can run the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start by creating an account and then uploading files via the "Upload" link in the sidebar.

### 6. Building and Deploying for Production

The `deploy` script combines deploying the function and building the Next.js app.

```bash
npm run deploy
```

This will first deploy any changes to the `password-reset` function and then create an optimized production build of your Next.js application in the `.next` folder.
