# 🔑 Environment Setup - Gemini API Key

## Quick Setup (2 Steps)

### Step 1: Create `.env.local` File

Create a new file named `.env.local` in the project root (same level as `package.json`):

```
VITE_GEMINI_API_KEY=AIzaSyDOx0W-espS2CDRk0D2l3WwccwFIguC_cY
```

**Location:**
```
Civic-Tech AI Assistant/
├── .env.local          ← Create this file
├── package.json
├── src/
└── ...
```

### Step 2: Restart the App

```bash
npm run dev
```

The app will now use your API key from `.env.local`

---

## ✅ What's Configured

### Models (Free Tier Compatible)
The app automatically uses the best available model:

1. **`gemini-1.5-flash`** ⚡ (Recommended for free tier)
   - Fastest response time
   - Perfect for free API key
   - Best for chat and document analysis

2. **`gemini-pro`** (Fallback)
   - Stable and reliable
   - Good for general queries

3. **`gemini-1.5-pro`** (Advanced)
   - Most powerful model
   - Used if available

### API Key Loading Priority
```
1. Check .env.local (VITE_GEMINI_API_KEY)
   ↓ (if not found)
2. Prompt user to enter API key
   ↓ (if not provided)
3. Error: API key required
```

---

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ API key is never exposed in code
- ✅ Only loaded at runtime
- ✅ Safe to use in development

---

## 📝 File Structure

```
.env.local (DO NOT COMMIT)
├── VITE_GEMINI_API_KEY=your_key_here

.env.example (FOR REFERENCE)
├── VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ✨ Features Now Working

✅ **Chat Mode**
- Uses `gemini-1.5-flash` for fast responses
- Multi-turn conversations
- Context awareness

✅ **Voice Mode**
- Real-time voice responses
- 10 language support
- Continuous conversation

✅ **Document Analysis**
- PDF, DOCX, TXT support
- Intelligent explanations
- Step-by-step guidance

✅ **Scheme Finder**
- Location-based scheme discovery
- Advanced filtering
- AI-powered recommendations

---

## 🚀 Testing

After setup, test all features:

1. **Chat**: Ask "How do I apply for Aadhaar?"
2. **Voice**: Select language and speak
3. **Documents**: Upload a PDF
4. **Schemes**: Find schemes for your state

---

## 🆘 Troubleshooting

### "API key not valid"
- Check `.env.local` file exists
- Verify key is correct (starts with `AIza`)
- Restart the app

### "No model available"
- Ensure API key is valid
- Check internet connection
- Try refreshing the page

### ".env.local not working"
- Make sure file is in project root (not in src/)
- Restart dev server after creating file
- Check file name is exactly `.env.local`

---

## 📊 Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- **Sufficient for development and testing**

---

## 💡 Tips

- Use `gemini-1.5-flash` for best free tier performance
- Keep API key private and never share
- Don't commit `.env.local` to Git
- For production, use proper secret management

---

**Setup Complete! 🎉 Your app is ready to use Gemini AI.**
