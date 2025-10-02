# ⚙️ Lumeo Setup Guide

This guide walks you through **setting up and running Lumeo locally**.

---

## 1️⃣ Install Dependencies

Install all required packages, including **Supabase CLI**:

```bash
npm install
```

---

## 2️⃣ Supabase Project Setup

Supabase stores metadata for your files (captions, IDs, timestamps, etc.).

### A. Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and sign in or create an account.  
2. Click **New Project** and give it a name.  
3. Save your **Database Password** (needed later).  
4. Wait for the project to be provisioned.

### B. Create `.env.local`
In the project root, create a file named `.env.local` and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
NEXT_PUBLIC_TG_BOT_TOKEN=
```

> Replace each value with your own credentials.

---

## 3️⃣ Connect Supabase & Push Schema

### A. Log in to Supabase
```bash
npm run supabase:login
```

### B. Link Your Project
```bash
npm run supabase:link
```
Select your organization and project, then enter your database password.

### C. Push Database Migrations
```bash
npm run supabase:db push
```
This applies all migration files, creating tables and security policies.

---

## 4️⃣ Deploy Edge Function (Password Reset)

### A. Set Function Secrets
```bash
npm run supabase:secrets:set -- SUPABASE_URL=... SUPABASE_SERVICE_KEY=...
```
> Replace `...` with the values from your `.env.local`.

### B. Customize Password Reset Email

>THIS FOR EMAIL OTP TEMPLATE YOU CAN ALSO MODIFY THE CODE TO MAKE IT MORE BEAUTIFUL.

Edit Supabase → **Authentication → Emails  → Reset Password → <> Source:Paste → Save Changes**:

### code editor

```bash
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: "Inter", sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
.container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px 30px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.logo { text-align: center; font-size: 26px; font-weight: 700; color: #3b82f6; margin-bottom: 10px; letter-spacing: 1px; }
h2 { font-size: 20px; text-align: center; color: #1f2937; margin-bottom: 15px; }
p { color: #4b5563; font-size: 15px; line-height: 1.6; text-align: center; margin: 12px 0; }
.code-box { background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 12px; padding: 18px; text-align: center; font-size: 26px; font-weight: 700; letter-spacing: 4px; color: #fff; margin: 25px auto; width: fit-content; }
.footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 40px; }
</style>
</head>
<body>
<div class="container">
<div class="logo">Lumeo</div>
<h2>Reset your password</h2>
<p>Hello,</p>
<p>We received a request to reset your Lumeo account password.</p>
<div class="code-box">{{ .Token }}</div>
<p>This code will expire in <strong>10 minutes</strong>.</p>
<p>If you didn’t request this, ignore this email.</p>
<div class="footer">© 2025 Lumeo · Secure Authentication</div>
</div>
</body>
</html>
```

#Deploy Edge Function

```bash
npm run supabase:functions:deploy -- password-reset
```
Verify deployment in **Supabase Dashboard → Edge Functions**.

---

## 5️⃣ Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
Create an account and start uploading your media.

---

## 6️⃣ Production Deployment

```bash
npm run deploy```

This deploys the **password-reset Edge Function** and builds an optimized production version of Lumeo.
