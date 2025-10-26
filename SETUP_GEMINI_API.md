# 🔑 Setting Up Google Gemini API

## Why You Need This
The Civic Life Companion uses Google Gemini AI to provide intelligent, agentic responses to all user queries. Without a valid API key, the chat and voice features won't work.

---

## Step 1: Get Your Free API Key

1. Go to **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Click **"Create API Key"**
3. Select **"Create API key in new project"**
4. Copy your API key (it will look like: `AIza...`)

> **Note:** Google provides free tier access with generous limits for development!

---

## Step 2: Add API Key to Your Project

### Option A: Using Environment Variable (Recommended)

1. Create a `.env.local` file in the project root:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

2. Replace `your_api_key_here` with your actual API key

3. Restart the development server:
```bash
npm run dev
```

### Option B: Prompt on First Use

If you don't set an environment variable, the app will prompt you to enter your API key when you first use the chat or voice features.

---

## Step 3: Test It Works

1. Open the app at `http://localhost:5173`
2. Go to **Civic Life Companion**
3. Type a question like: "How do I apply for Aadhaar?"
4. You should get an intelligent response from Gemini AI

---

## Troubleshooting

### Error: "API key not valid"
- Check that your API key is correct
- Make sure there are no extra spaces
- Verify the key starts with `AIza`
- Try generating a new key

### Error: "API key not found"
- Make sure `.env.local` file exists in the project root
- Check the filename is exactly `.env.local` (not `.env`)
- Restart the dev server after creating the file

### Chat/Voice not responding
- Check browser console for error messages
- Verify API key is valid
- Check your internet connection
- Try refreshing the page

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Don't share your API key publicly
- The `.env.example` file shows the format without actual keys
- For production, use proper environment variable management

---

## Features Enabled with Gemini API

✅ **Chat Interface**
- Ask questions about government services
- Upload and analyze civic documents
- Get step-by-step guidance

✅ **Voice Mode**
- Speak questions in 10 Indian languages
- Get voice responses in your language
- Continuous conversation support

✅ **Document Analysis**
- Upload PDF, DOCX, or TXT files
- AI explains what the document is about
- Get guidance on next steps

---

## API Limits

Google's free tier includes:
- **60 requests per minute**
- **1,500 requests per day**
- Sufficient for development and testing

For production use, check [Google's pricing](https://ai.google.dev/pricing).

---

## Need Help?

- Check [Google Generative AI Documentation](https://ai.google.dev/docs)
- Visit [Google AI Studio](https://makersuite.google.com/)
- Check browser console for detailed error messages
