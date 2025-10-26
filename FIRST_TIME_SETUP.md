# 🚀 First Time Setup - 2 Minutes

## Step 1: Get Your Free API Key (1 minute)

1. Open: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Click **"Create API key in new project"**
4. **Copy** your API key (looks like: `AIza...`)

> ✅ **Free tier:** 60 requests/minute, 1,500 requests/day

---

## Step 2: Run the App (1 minute)

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

The app opens at: `http://localhost:5173`

---

## Step 3: First Use - Provide API Key

When you first use **Chat** or **Voice** features:

1. A popup appears asking for your API key
2. **Paste** your API key from Step 1
3. Click **OK**
4. ✅ Done! You're ready to use the app

---

## Alternative: Use Environment Variable

If you want to skip the popup:

1. Create `.env.local` file in project root:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

2. Replace `your_api_key_here` with your actual key

3. Restart the app:
```bash
npm run dev
```

---

## ✅ Test It Works

### Chat Mode
- Open **Civic Life Companion**
- Type: "How do I apply for Aadhaar?"
- ✅ Get intelligent response

### Voice Mode
- Click **Voice Assistant** (bottom-right)
- Select language (e.g., Hindi)
- Click **Speak** button
- Say: "Tell me about PAN card"
- ✅ Get voice response in Hindi

### Document Upload
- Click **Upload Document**
- Select a PDF/DOCX file
- ✅ AI analyzes and explains

---

## 🆘 Troubleshooting

### "API key not valid"
- Check your key starts with `AIza`
- Make sure no extra spaces
- Generate a new key if needed

### "Method doesn't allow unregistered callers"
- You didn't provide an API key
- The popup should appear - enter your key
- Or create `.env.local` file

### Nothing happens when I click Chat
- Check browser console (F12)
- Make sure API key is set
- Try refreshing the page

---

## 📚 More Help

- Full setup guide: `SETUP_GEMINI_API.md`
- Features overview: `AGENTIC_MODE_GUIDE.md`
- Main README: `README.md`

---

**That's it! You're all set! 🎉**
