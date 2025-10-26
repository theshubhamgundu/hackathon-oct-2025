# Quick Start Guide - File Upload Feature

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

This will install the new dependencies:
- `pdfjs-dist`: For PDF text extraction
- `mammoth`: For DOCX text extraction

### Step 2: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the configured port)

## Testing the Feature

### Step 1: Login to the App
1. Open the app in your browser
2. Sign up or login with your credentials
3. Navigate to the dashboard

### Step 2: Open Civic Life Companion
1. Click on "Civic Life Companion" from the dashboard
2. You should see the chat interface with the greeting message

### Step 3: Upload a Test Document

#### Option A: Test with a Sample PDF
1. Click the **Upload button** (📤 icon) in the input area
2. Select a PDF file from your computer
3. You should see a blue preview panel showing:
   - File name
   - File size in KB
4. Click the **Analyze** button
5. Wait for the analysis to complete

#### Option B: Test with a Sample DOCX
1. Click the **Upload button** (📤 icon)
2. Select a DOCX file
3. The file preview will appear
4. Click **Analyze**

#### Option C: Test with a Text File
1. Click the **Upload button** (📤 icon)
2. Select a TXT file
3. Click **Analyze**

### Step 4: View Results
After analysis completes, you should see:
- A user message showing the file name and analysis status
- An assistant message with the system instructions containing:
  - Document classification
  - Key topics identified
  - Document summary
  - Civic guidance
  - Recommended actions

### Step 5: Test Error Handling

#### Test File Size Validation
1. Try uploading a file larger than 10MB
2. You should see error: "File size exceeds 10MB limit"

#### Test Format Validation
1. Try uploading an unsupported file format (e.g., .exe, .zip)
2. You should see error: "Unsupported file format. Please use PDF, DOCX, DOC, or TXT"

## Sample Test Documents

### Create a Test PDF
You can use any PDF document. For testing, try:
- Government scheme PDFs
- Aadhaar update guides
- Ration card application forms
- Passport application guides

### Create a Test DOCX
Create a simple Word document with content like:
```
Aadhaar Update Procedure

The Aadhaar card is a unique identification document issued by UIDAI.
To update your Aadhaar:
1. Visit the nearest Aadhaar Seva Kendra
2. Fill the update form
3. Provide required documents
4. Complete the process
```

### Create a Test TXT
Create a text file with government service information:
```
PAN Card Application Guide

PAN (Permanent Account Number) is issued by the Income Tax Department.
To apply for PAN:
1. Visit NSDL website
2. Fill Form 49A
3. Upload documents
4. Pay processing fee
5. Receive PAN in 15-20 days
```

## Expected Behavior

### Successful Upload & Analysis
```
✅ File selected and validated
✅ File preview displayed
✅ Analysis button enabled
✅ File analyzed successfully
✅ System instructions generated
✅ Results displayed in chat
```

### File Analysis Output Example
```
# Civic Life Companion - System Instructions

**Document:** aadhaar_guide.pdf
**Analysis Date:** 2024-01-15T10:30:00.000Z

## Document Classification
- **Type:** Government Document
- **Category:** Service/Procedure Guide

## Key Topics Identified
- Aadhaar
- Update
- Verification
- Government Services

## Document Summary
The Aadhaar card is a unique identification document issued by UIDAI...

## Civic Life Companion Guidance
**Aadhaar Services:** This document relates to Aadhaar. You can update 
your Aadhaar at any Aadhaar Seva Kendra...

## Recommended Actions
1. Check the expiry date of your Aadhaar
2. Gather required documents for update
3. Visit the relevant Aadhaar Seva Kendra
4. Complete the update process
```

## Troubleshooting

### Issue: Upload button not visible
**Solution:**
- Refresh the page
- Check browser console for errors
- Ensure you're logged in

### Issue: File selection dialog doesn't open
**Solution:**
- Check browser file access permissions
- Try a different browser
- Clear browser cache

### Issue: PDF extraction fails
**Solution:**
- Ensure PDF is not encrypted
- Try converting to a standard PDF format
- Check file is not corrupted

### Issue: Analysis takes too long
**Solution:**
- Check internet connection
- Try with a smaller file
- Check browser console for errors

### Issue: Error message appears
**Solution:**
- Read the error message carefully
- Check file format and size
- Try with a different file
- Check browser console for details

## Browser Compatibility

### Recommended Browsers:
- ✅ Chrome/Chromium (best support)
- ✅ Edge (good support)
- ✅ Firefox (good support)
- ⚠️ Safari (may have issues with file extraction)

## Performance Tips

1. **Use smaller files**: Files under 5MB process faster
2. **Text-based PDFs**: Extract text faster than scanned PDFs
3. **Clear cache**: Improves performance
4. **Close other tabs**: Frees up browser memory

## Next Steps

After testing the file upload feature:

1. **Test with different document types**:
   - Government schemes
   - Application guides
   - Policy documents
   - Service procedures

2. **Verify civic guidance**:
   - Check if guidance matches document content
   - Verify links are correct
   - Test action items are relevant

3. **Check error handling**:
   - Test with invalid files
   - Test with large files
   - Test with corrupted files

4. **Integration testing**:
   - Test with other app features
   - Test chat history with uploaded documents
   - Test on different devices

## Debugging

### Enable Console Logging
Open browser DevTools (F12) and check Console tab for:
- File validation logs
- Extraction progress
- API call details
- Error messages

### Check Network Tab
Monitor API calls:
- POST `/make-server-8457b97f/analyze-document`
- Check request/response payloads
- Verify authentication headers

### Common Log Messages
```
File validation: success
Extracting text from PDF...
Sending to API for analysis...
Analysis complete
```

## Support

For issues or questions:
1. Check the FILE_UPLOAD_FEATURE.md documentation
2. Review error messages in browser console
3. Try with a different test document
4. Contact the development team

---

**Ready to test?** Start with Step 1 above! 🚀
