# AI Cosmic Palmistry & Astrology Scanner

A stunning, premium, and interactive web application that provides a personalized Cosmic Life Blueprint. It calculates astrological alignments, Life Path numerology, and reads hand palm images. 

This repository is fully configured for seamless, secure deployment on **Vercel** with support for Vercel Serverless Functions.

---

## 🚀 How to Deploy on Vercel

You can deploy this application to Vercel in just a few clicks:

### Step 1: Install Vercel CLI (Optional)
If you want to deploy from your terminal:
```bash
npm install -g vercel
vercel
```

### Step 2: Set your Gemini API Key
To enable real, open-ended conversational AI through the Oracle:
1. Go to your **Vercel Dashboard**.
2. Select your newly deployed project.
3. Navigate to **Settings** > **Environment Variables**.
4. Add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *Your Google Gemini API Key* (Obtain a key from [Google AI Studio](https://aistudio.google.com/)).
5. Click **Save**.
6. Trigger a **Redeploy** on Vercel to apply the environment variables.

---

## 💻 Local Development

You can run this application locally in two modes:

### Mode A: Full Dev Mode (Serverless API + Frontend)
If you want to test the serverless API proxy locally with your API key, make sure you have Vercel CLI installed and run:
```bash
# Add your local env key
# Create a .env file: GEMINI_API_KEY=your_key
vercel dev
```

### Mode B: Static Offline Mode (No Setup Required)
If you don't want to deal with backend APIs or API keys locally, you can run the app as a pure static webpage. It will automatically detect that the serverless API is inactive and fall back to the **local simulated AI engine**:
```bash
npm start
```
This launches a simple Python-based HTTP server at `http://localhost:8000`.

---

## 📂 Project Structure

* `/api/oracle.js`: Vercel serverless Node.js function proxying Gemini calls.
* `vercel.json`: Routing configurations for clean URLs.
* `package.json`: Project dependency configuration and run scripts.
* `index.html`: Main visual interface and capture frames.
* `styles.css`: CSS variables, animations, glassmorphic layout, and print media rules.
* `app.js`: Client-side state manager, camera control, calculations, and fallback triggers.
* `celestial_chart.png` & `palmistry_hand.png`: Astral visual assets.
