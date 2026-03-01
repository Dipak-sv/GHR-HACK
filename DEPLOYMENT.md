# 🚀 Prescripto Deployment Guide

This guide will walk you through deploying the **Prescripto AI** application. 

### 🛑 Golden Rule: Backend First!
**You must deploy the backend first.** Why? The frontend needs to know where to send its API requests. Once the backend is live, it will give you a URL (e.g., `https://prescripto-api.onrender.com`). You will take that URL and give it to the frontend during its deployment.

---

## Part 1: Deploying the Backend on Render 🟢

Render is perfect for hosting our Node.js/Express backend.

### Prerequisites
1. Create an account on [Render](https://render.com/).
2. Ensure your code is pushed to a GitHub repository.

### Steps
1. Log in to Render and click **New +** -> **Web Service**.
2. Connect your GitHub account and select your repository.
3. **Configure the Web Service:**
   - **Name:** `prescripto-backend` (or similar)
   - **Region:** Choose the one closest to you.
   - **Branch:** `main`
   - **Root Directory:** `backend` *(⚠️ crucial step: type exactly `backend` since your server code is nested in this folder).*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   Scroll down to the Environment Variables section and add everything from your `backend/.env.example` file:
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB connection string*
   - `GROQ_API_KEY`: *Your Groq AI API key*
   - `JWT_SECRET`: *Your JWT secret*
   - `FRONTEND_URL`: *For now, type `*` (we will change this to your Vercel URL later for security).*
   - *(Optional) Twilio SMS Variables if you are using them.*
5. **Deploy!** Click the **Create Web Service** button at the bottom.
6. Wait for the build to finish. Once it says "Live", copy the URL Render gives you at the top left (e.g., `https://prescripto-backend.onrender.com`). **Save this URL!**

---

## Part 2: Deploying the Frontend on Vercel ▲

Vercel is the easiest and fastest way to host your Vite/React frontend.

### Prerequisites
1. Create an account on [Vercel](https://vercel.com).
2. Ensure your code is pushed to GitHub.

### Steps
1. Log in to Vercel and click **Add New...** -> **Project**.
2. Connect to GitHub and **Import** your repository.
3. **Configure the Project:**
   - **Project Name:** `prescripto`
   - **Framework Preset:** `Vite` (Vercel should automatically detect this).
   - **Root Directory:** Keep this as `./` (default) because your Vite app is in the root directory.
   - **Build and Output Settings:** Leave default (Build: `npm run build`, Output: `dist`).
4. **Environment Variables:**
   Expand the Environment Variables dropdown and add the URL you copied from Render:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://prescripto-backend.onrender.com` *(Paste YOUR Render URL here. Do not add a trailing slash `/` at the end).*
5. Click **Deploy**.
6. Wait for the confetti! 🎉 Once done, Vercel will give you a live URL for your app (e.g., `https://prescripto.vercel.app`).

---

## Part 3: Securing the Backend (Final Polish) 🔒

Now that you have your Vercel URL, let's lock down the backend so *only* your Vercel site can talk to it.

1. Go back to Render.
2. Open your `prescripto-backend` web service.
3. Navigate to the **Environment** tab on the left.
4. Edit the `FRONTEND_URL` variable.
5. Change it from `*` to your new Vercel URL (e.g., `https://prescripto.vercel.app`).
6. Save changes. Render will briefly restart the service.

**🎉 Congratulations! Prescripto AI is now actively deployed to production!**
