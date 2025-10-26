# 🏛️ Civic-Tech AI Assistant

An intelligent, agentic AI assistant powered by **Google Gemini** to help Indian citizens navigate government services, schemes, and civic procedures.

**Original Design:** https://www.figma.com/design/stPIwbhtbIYLB3K0djkfzV/Civic-Tech-AI-Assistant

---

## ✨ Features

### 🤖 Full Agentic Mode
- **Intelligent Chat** - Ask anything about government services, schemes, and procedures
- **Document Analysis** - Upload PDFs, DOCX, or TXT files and get AI-powered explanations
- **Multi-turn Conversations** - Maintains context across multiple messages
- **No Rules-Based Responses** - All responses powered by Gemini AI

### 🎤 Voice Assistant
- **Multi-language Support** - 10 Indian languages (English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi)
- **Real-time Voice Responses** - Speak and get voice responses in your language
- **Continuous Conversation** - Agent listens for follow-up questions
- **Language Switching** - Change language anytime

### 📄 Document Processing
- **PDF Extraction** - Extract text from PDF files
- **DOCX Support** - Parse Word documents
- **Text Files** - Direct text file analysis
- **Intelligent Analysis** - AI explains documents clearly

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Gemini API Key
See [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md) for detailed instructions.

Quick version:
```bash
# Create .env.local file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local
```

Get your free API key from: https://makersuite.google.com/app/apikey

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📋 Project Structure

```
src/
├── components/
│   ├── CivicCompanion.tsx       # Main chat interface (Agentic)
│   ├── VoiceAssistant.tsx       # Voice mode with Gemini AI
│   └── ...other components
├── utils/
│   ├── geminiService.ts         # Gemini AI integration
│   ├── fileProcessor.ts         # Document processing
│   └── ...other utilities
└── ...other files
```

---

## 🔧 Key Technologies

- **Frontend:** React + TypeScript + Vite
- **AI:** Google Generative AI (Gemini Pro)
- **Voice:** Web Speech API
- **Document Processing:** PDF.js, Mammoth.js
- **UI:** Tailwind CSS + shadcn/ui

---

## 📖 Usage Examples

### Chat Mode
```
User: "How do I apply for Aadhaar?"
AI: [Provides step-by-step guidance on Aadhaar application]

User: "What documents do I need?"
AI: [Continues conversation with relevant information]
```

### Voice Mode
```
User: Speaks "Tell me about PAN card"
AI: Responds with voice explanation in selected language
User: Speaks follow-up question
AI: Continues conversation with voice response
```

### Document Analysis
```
User: Uploads "Aadhaar_Guide.pdf"
AI: Analyzes and explains the document
    - What it's about
    - Key information
    - Next steps
    - Related services
```

---

## 🔐 Security

- API keys are stored in `.env.local` (not committed to Git)
- `.gitignore` prevents sensitive files from being uploaded
- See `.env.example` for configuration format

---

## 📚 Documentation

- **[SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md)** - Detailed API setup guide
- **[AGENTIC_MODE_GUIDE.md](./AGENTIC_MODE_GUIDE.md)** - Features and architecture
- **[QUICK_START_FILE_UPLOAD.md](./QUICK_START_FILE_UPLOAD.md)** - File upload testing

---

## 🐛 Troubleshooting

### "API key not valid" Error
1. Check your API key is correct
2. Verify it starts with `AIza`
3. Generate a new key if needed
4. See [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md)

### Voice Not Working
1. Check browser microphone permissions
2. Use Chrome or Edge browser
3. Verify API key is set
4. Check browser console for errors

### PDF Upload Fails
1. Ensure file is not corrupted
2. Try a different PDF file
3. Check file size (should be reasonable)
4. Check browser console for errors

---

## 📝 Environment Variables

Create `.env.local` with:
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=optional_supabase_url
VITE_SUPABASE_ANON_KEY=optional_supabase_key
```

---

## 🎯 Supported Languages

Voice and chat support for:
- English
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Verify API key setup
4. Check internet connection

---

## 📄 License

This project is part of the Civic-Tech AI Assistant initiative.

---

## 🙏 Acknowledgments

Built with:
- Google Generative AI (Gemini)
- React & TypeScript
- Tailwind CSS & shadcn/ui
- Community contributions
  