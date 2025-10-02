README.md
# 🎨 Lumeo - A Personal Free Cloud Media Gallery Storage

![Lumeo Banner](assets/banner.png)
 

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-blue)](https://vercel.com/new)  

**Lumeo** is a **Next.js web application** that acts as a **personal media gallery**.  
It uses **Telegram** for storage and **Supabase** for metadata management, allowing you to **upload, view, and organize images, videos, and documents** in a stunning, responsive gallery.

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 📂 **Album Organization** | Organize files into multiple albums |
| 🖼 **Multi-file Support** | Upload images, videos, and documents |
| 🚀 **Telegram Storage** | Uses Telegram’s robust file storage |
| 🗄 **Supabase Backend** | Fast metadata storage and querying |
| 🖼 **Responsive Gallery** | Masonry-style, fluid layout |
| 📝 **File Management** | Edit captions, move files across albums |
| 🗑 **Trash Bin** | Soft-delete files or permanently remove them |

---

## 📸 Demo / Preview


### Front Page
![Front Page](assets/front_page.png)
*A clean landing page welcoming users to Lumeo.*

### Sign In Form
![Sign In Form](assets/sign_in.png)
*Users can securely log in with email/password.*

### Reset Password
![Reset Password](assets/reset_password.png)
*Easily reset your password with a simple form.*

### Gmail OTP Verification
![Gmail OTP](assets/gmail_otp.png)
*Secure login with Gmail OTP for added security.*

### gallery
![gallery](assets/banner.png)
*gallery view.*

### Albums
![Albums](assets/album.png)
*Organize your files into albums for easy access.*

### Upload Files
![media Upload](assets/upload.png)
*Upload your media files safely.*

### Storage
![Storage Upload](assets/storage.png)
*monitor your storage.*


---

## ⚡ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) + [React](https://react.dev/)  
- **Backend:** [Supabase](https://supabase.com/)  
- **Storage:** [Telegram Bot API](https://core.telegram.org/bots/api)  
- **Styling:** TailwindCSS  

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/milan-m-antony/lumeo-teli-gallery.git 
```
```bash
cd lumeo
```

### 2️⃣ Install Dependencies
```bash
npm install
```
Installs all required packages including Supabase CLI.

### 3️⃣ Setup Environment Variables
Create a `.env.local` file in the root:

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

> Replace each value with your credentials.

### 🔧 Setup & Configuration
For database setup, migrations, and Edge Function deployment, see `SETUP.md`.

### 🖥 Running Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) and create an account to start uploading your media.

### 🌐 Production Deployment
```bash
npm run deploy
```
Deploys the password-reset Edge Function and builds an optimized production version of the app.

![Lumeo Banner](assets/banner.png)

# 🎨 Lumeo - Personal Media Gallery

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

Lumeo is a **Next.js application** that acts as a personal media gallery.  
It uses **Telegram** for file storage and **Supabase** for metadata management.  
Upload, view, and manage your photos, videos, and documents in a clean, web-based interface.

---

## 📌 Features
- Multi-album organization  
- File upload and storage  
- Sign in / Sign up / Gmail OTP authentication  
- Password reset  
- Responsive front page and dashboard  
- Production-ready deployment with Edge Functions  

---

## 📸 Demo / Preview

### Front Page
![Front Page](assets/front_page.png)

### Sign In Form
![Sign In Form](assets/sign_in.png)

### Reset Password
![Reset Password](assets/reset_password.png)

### Gmail OTP Verification
![Gmail OTP](assets/gmail_otp.png)

### Storage / Upload Files
![Storage Upload](assets/storage.png)

### Albums
![Albums](assets/album.png)

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/milan-m-antony/lumeo-teli-gallery.git```
```bash
cd lumeo```

### 2️⃣ Install Dependencies
```bash
npm install```
Installs all required packages including Supabase CLI.

### 3️⃣ Setup Environment Variables
Create a `.env.local` file in the root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
NEXT_PUBLIC_TG_BOT_TOKEN=```

> ⚠️ **Do not commit secrets to GitHub.** Keep them only in `.env.local` or in Vercel.

### 🔧 Setup & Configuration
For database setup, migrations, and Edge Function deployment, see `SETUP.md`.

### 🖥 Running Locally
```bash
npm run dev```
Visit [http://localhost:3000](http://localhost:3000) and create an account to start uploading your media.

### 🌐 Production Deployment
```bash
npm run deploy```
Deploys the password-reset Edge Function and builds an optimized production version of the app.

---

## ☁️ Hosting on Vercel

You can easily deploy **Lumeo** on Vercel:

### 1️⃣ Sign Up / Login
- Go to [Vercel](https://vercel.com)  
- Sign in with **GitHub** and authorize access to your repo.

### 2️⃣ Import Repository
- Click **New Project → Import Git Repository**  
- Select `lumeo-teli-gallery` and click **Import**  

### 3️⃣ Add Environment Variables
Go to **Settings → Environment Variables** and add the following:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=your-channel-id
NEXT_PUBLIC_TG_BOT_TOKEN=your-public-bot-token```

> ⚠️ **Important:** Do not commit secrets to GitHub.

### 4️⃣ Deploy
- **Framework Preset:** Next.js  
- **Build Command:** `npm run build`  
- **Output Directory:** `.next`  
- Click **Deploy**  

Vercel will provide a live URL like: 🌐 `https://your-project.vercel.app`  
Your app is now online! Updates are automatically deployed whenever you push to GitHub.

### 🔧 Tips
- Use **Preview Environment** for testing changes before production.  
- Edge Functions (like password-reset) are automatically deployed as serverless functions.  
- You can connect a **custom domain** via Vercel settings.

---

## 📄 License
This project is licensed under the [MIT License](./LICENSE).

© 2025 Milan M Antony
