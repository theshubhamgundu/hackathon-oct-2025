# JanAI - Enhanced Features Guide

## 🎤 AI Voice Mode

JanAI now includes a powerful voice assistant that allows you to operate the entire application using voice commands in multiple Indian languages.

### How to Use Voice Assistant

1. **Access**: The voice assistant appears as a floating button in the bottom-right corner of the screen (available on all screens after login)

2. **Activate**: Click the microphone button or the floating assistant to open the voice panel

3. **Speak**: Click "Speak" and give your command in any supported language

4. **Listen**: The assistant will respond with voice feedback

### Supported Voice Commands

**Navigation Commands:**
- "Open dashboard" / "डैशबोर्ड खोलें"
- "Show my documents" / "मेरे दस्तावेज़ दिखाएं"
- "Find schemes" / "योजनाएं खोजें"
- "File a complaint" / "शिकायत दर्ज करें"
- "Open profile" / "प्रोफ़ाइल खोलें"
- "Open chat" / "चैट खोलें"

**General Queries:**
Any question about government services will be automatically routed to the Civic Life Companion

### Voice Features

- **Continuous Listening**: Start speaking and the assistant will transcribe in real-time
- **Text-to-Speech**: Hear responses spoken back to you
- **Language Detection**: Automatically detects and responds in your selected language
- **Visual Feedback**: See your spoken words transcribed on screen

## 🌐 Multilingual Support

JanAI supports **10 Indian languages**:

1. **English** (English)
2. **Hindi** (हिन्दी)
3. **Tamil** (தமிழ்)
4. **Telugu** (తెలుగు)
5. **Bengali** (বাংলা)
6. **Marathi** (मराठी)
7. **Gujarati** (ગુજરાતી)
8. **Kannada** (ಕನ್ನಡ)
9. **Malayalam** (മലയാളം)
10. **Punjabi** (ਪੰਜਾਬੀ)

### How to Change Language

**Method 1: Dashboard Language Selector**
- On the dashboard, find the language dropdown in the top-right corner
- Select your preferred language from the list
- The interface will update immediately

**Method 2: Voice Assistant**
- Open the voice assistant
- Select language from the dropdown in the assistant panel
- Voice recognition and speech synthesis will adapt to your selection

### What Gets Translated

- **UI Elements**: Buttons, labels, headings
- **Navigation**: Menu items, module titles
- **Messages**: System messages, confirmations
- **Voice Responses**: Spoken feedback in selected language

## 👨‍👩‍👧‍👦 Family Document Sharing

The enhanced e-Document Wallet now supports family sharing, allowing you to securely share documents with family members in real-time.

### Setting Up Family Sharing

1. **Navigate to Document Wallet**
   - Click on "e-Document Wallet" from the dashboard

2. **Add Family Members**
   - Click the "Family" button in the top-right corner
   - Click "Add Family Member"
   - Fill in details:
     - **Name**: Full name of the family member
     - **Email**: Their registered email address
     - **Relation**: Select relationship (Spouse, Parent, Child, etc.)
     - **Can Edit**: Toggle to allow editing permissions
   - Click "Add Family Member"

3. **Upload Documents**
   - Any document you upload is automatically accessible to all family members you've added
   - Documents appear in real-time for family members

### Family Member Permissions

**View Only** (Default):
- Family member can view and download documents
- Cannot delete or modify your documents
- Safe for sharing with extended family

**Can Edit** (Optional):
- Family member can view, download, and delete documents
- Use for close family members (spouse, parents)
- Provides full document management access

### Viewing Shared Documents

The Document Wallet has two tabs:

1. **My Documents**
   - Documents you've uploaded
   - Full control to add, view, download, delete
   - Visible to all your family members

2. **Family Shared**
   - Documents shared by family members who added you
   - Shows owner's email for each document
   - Can view and download (edit if permission granted)

### Real-Time Sync

- Documents appear **instantly** when uploaded by any family member
- No need to refresh - automatic real-time updates
- All family members see the same document library simultaneously

### Use Cases

**Medical Records:**
- Parents can access children's vaccination records
- Adult children can manage elderly parents' medical documents

**Property Documents:**
- Share land deeds, property papers with family
- Multiple family members can access during legal procedures

**Educational Certificates:**
- Parents access children's school/college certificates
- Shared access for scholarship applications

**Government IDs:**
- Centralized family ID repository
- Quick access for all family members during travel or applications

### Security & Privacy

- Only explicitly added family members can access your documents
- Remove any family member anytime to revoke access
- All documents remain encrypted in Supabase Storage
- Signed URLs ensure secure file access
- Each user maintains separate login credentials

### Managing Family Members

**View Family List:**
- Click "Family" button to see all added members
- Shows name, email, relation, and permissions

**Remove Family Member:**
- Click the X button next to their name
- They immediately lose access to your documents
- Your documents remain safe and unchanged

## 🔐 Browser Compatibility

### Voice Features Support

**✅ Fully Supported:**
- Google Chrome (Desktop & Mobile)
- Microsoft Edge (Desktop)
- Opera (Desktop)

**⚠️ Limited Support:**
- Safari (Desktop): Speech recognition may vary
- Firefox: Text-to-speech works, recognition limited

**❌ Not Supported:**
- Internet Explorer
- Older mobile browsers

### Recommended Setup

For the best JanAI experience:
- **Browser**: Google Chrome (latest version)
- **Microphone**: Allow microphone access when prompted
- **Audio**: Enable speakers for voice responses
- **Connection**: Stable internet for real-time features

## 💡 Tips & Best Practices

### Voice Commands

1. **Speak Clearly**: Enunciate words for better recognition
2. **Quiet Environment**: Minimize background noise
3. **Natural Pace**: Don't speak too fast or too slow
4. **Command Structure**: Use simple, direct commands

### Language Selection

1. **Match Voice & UI**: Set both voice assistant and UI to same language
2. **Regional Dialects**: Standard dialect recognition works best
3. **Code-Switching**: Stick to one language per command

### Family Sharing

1. **Regular Updates**: Keep family members list current
2. **Permission Review**: Periodically review who has edit access
3. **Document Organization**: Use clear naming for easy identification
4. **Storage Limits**: Monitor total storage usage

## 🆘 Troubleshooting

### Voice Not Working?

1. Check browser compatibility (use Chrome)
2. Allow microphone permissions in browser settings
3. Test microphone in system settings
4. Refresh the page and try again

### Language Not Changing?

1. Reload the page after language change
2. Clear browser cache if issues persist
3. Check that language is supported in current feature

### Family Member Can't See Documents?

1. Verify email address is correct
2. Ensure they're logged in with the same email
3. Check that documents were uploaded after adding them
4. Refresh their document wallet page

### Shared Documents Not Appearing?

1. Verify you're added as family member by the owner
2. Check "Family Shared" tab (not "My Documents")
3. Ensure owner has uploaded documents
4. Refresh the page

## 🚀 Future Enhancements

Planned features for upcoming releases:

- **AI-Powered Document Understanding**: Automatic extraction of information from uploaded documents
- **Voice-to-Text Complaint Filing**: File complaints entirely through voice
- **Smart Scheme Recommendations**: AI suggests schemes based on your profile and documents
- **Family Group Chat**: Discuss documents and schemes with family members
- **OCR Integration**: Extract text from scanned documents
- **Multi-factor Authentication**: Enhanced security for sensitive documents
- **Document Expiry Reminders**: Notifications for passport, license renewals
- **Offline Mode**: Access cached documents without internet

---

## 📞 Support

For technical assistance or feature requests, this is a prototype application. For production deployment, implement proper support channels and comply with India's Digital Personal Data Protection Act 2023.

---

**Built with ❤️ for Digital India**
