# Civic Life Companion - File Upload Feature

## Overview

The Civic Life Companion now supports document upload and analysis. Users can upload PDF, DOCX, DOC, or TXT files, and the system will analyze them to generate comprehensive system instructions for civic services.

## Features Added

### 1. Frontend File Upload UI (CivicCompanion.tsx)

#### New UI Components:
- **Upload Button**: Click to select files from your device
- **File Preview Panel**: Shows selected file name and size before analysis
- **Error Display**: Shows validation errors if file format or size is invalid
- **Analyze Button**: Triggers document analysis
- **Cancel Button**: Removes selected file

#### Supported File Formats:
- PDF (.pdf)
- Word Documents (.docx, .doc)
- Text Files (.txt)

#### File Size Limit:
- Maximum 10MB per file

### 2. File Processing Utility (fileProcessor.ts)

#### Functions:
- `extractTextFromPDF()`: Extracts text from PDF files using pdf.js
- `extractTextFromDOCX()`: Extracts text from DOCX files using mammoth
- `extractTextFromFile()`: Main function that routes to appropriate extractor
- `validateFile()`: Validates file format and size

#### Supported Formats:
- **PDF**: Full text extraction with page-by-page processing
- **DOCX**: Complete text extraction from Word documents
- **DOC**: Legacy format support (requires .docx conversion)
- **TXT**: Direct text reading

### 3. Backend Analysis Endpoint (/analyze-document)

#### Endpoint Details:
- **URL**: `/make-server-8457b97f/analyze-document`
- **Method**: POST
- **Authentication**: Bearer token required
- **Request Body**:
  ```json
  {
    "documentContent": "extracted text from file",
    "fileName": "document.pdf"
  }
  ```

#### Response Format:
```json
{
  "systemInstructions": "# Civic Life Companion - System Instructions\n...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. Document Analysis Features

#### Document Classification:
The system automatically classifies documents as:
- Government Document
- Government Scheme/Benefit
- Service/Procedure Guide
- Policy/Regulation

#### Key Topics Extraction:
Identifies relevant topics including:
- Aadhaar, PAN, Ration Card, Passport
- Driving License, Voter ID
- Income Certificate, Caste Certificate
- Property, Land, Utilities
- Pension, Scholarship, Loan
- Application, Registration, Renewal

#### Generated System Instructions Include:
1. **Document Classification**: Type and category of document
2. **Key Topics**: Identified relevant topics from content
3. **Document Summary**: Brief overview of document content
4. **Civic Life Companion Guidance**: Relevant government service information
5. **Recommended Actions**: Step-by-step action items based on document type

### 5. Smart Guidance Generation

The system provides context-aware guidance based on document content:

- **Aadhaar Documents**: Links to UIDAI portal and Aadhaar Seva Kendra information
- **Ration Card**: Information about State Food & Civil Supplies
- **Passport**: Links to Passport India portal and appointment booking
- **PAN Card**: NSDL portal information and processing timelines
- **Government Schemes**: Links to PM Schemes Portal
- **Complaints**: Information about filing complaints through the app

## How to Use

### For Users:

1. **Open Civic Life Companion**
   - Navigate to the Civic Life Companion from the dashboard

2. **Upload a Document**
   - Click the Upload button (📤 icon) in the input area
   - Select a PDF, DOCX, DOC, or TXT file from your device
   - File must be less than 10MB

3. **Review File Details**
   - File name and size will be displayed
   - Verify the correct file is selected

4. **Analyze Document**
   - Click the "Analyze" button
   - System will extract text and generate instructions
   - Wait for the analysis to complete

5. **View Results**
   - System instructions will appear as a message
   - Contains document classification, key topics, and guidance
   - Can scroll through the full analysis

6. **Follow Recommendations**
   - Review the recommended actions
   - Click on provided links for more information
   - Contact relevant government departments as needed

### Example Workflow:

```
1. User uploads "Aadhaar_Update_Guide.pdf"
   ↓
2. System extracts text from PDF
   ↓
3. Analysis identifies: Aadhaar, Update, Government Document
   ↓
4. System generates instructions with:
   - Document classification
   - Key topics found
   - Aadhaar-specific guidance
   - Steps to update Aadhaar
   ↓
5. User sees results and can follow the guidance
```

## Technical Architecture

### Frontend Flow:
```
User selects file
    ↓
validateFile() checks format/size
    ↓
File displayed in preview panel
    ↓
User clicks Analyze
    ↓
extractTextFromFile() processes file
    ↓
API call to /analyze-document
    ↓
System instructions displayed in chat
```

### Backend Flow:
```
POST /analyze-document
    ↓
Authentication check
    ↓
generateSystemInstructions()
    ├─ Document classification
    ├─ extractKeyTopics()
    ├─ extractDocumentSummary()
    ├─ generateCivicGuidance()
    └─ generateActionItems()
    ↓
Return formatted instructions
```

## Dependencies

### Frontend:
- `pdfjs-dist`: ^4.0.379 - PDF text extraction
- `mammoth`: ^1.6.0 - DOCX text extraction
- `lucide-react`: Icons for upload UI
- `react`: UI framework

### Backend:
- `hono`: Web framework (already in use)
- `@supabase/supabase-js`: Database and auth
- Built-in Deno APIs for text processing

## Error Handling

### Validation Errors:
- **File too large**: "File size exceeds 10MB limit"
- **Unsupported format**: "Unsupported file format. Please use PDF, DOCX, DOC, or TXT"
- **Empty file**: "Document content is required"

### Processing Errors:
- **Extraction failed**: "Error analyzing document: [specific error]"
- **API error**: "Failed to analyze document"
- **Authentication error**: "Unauthorized"

## Limitations & Future Enhancements

### Current Limitations:
- Legacy .doc format requires conversion to .docx
- Analysis based on keyword matching (not AI-powered)
- Maximum file size 10MB
- Text extraction quality depends on PDF/document quality

### Future Enhancements:
- AI-powered document understanding using LLMs
- OCR support for scanned documents
- Multi-language document support
- Document storage and history
- Batch file upload
- Document comparison
- Custom analysis templates
- Integration with government portals

## Testing Checklist

- [ ] Upload PDF file successfully
- [ ] Upload DOCX file successfully
- [ ] Upload TXT file successfully
- [ ] Reject files larger than 10MB
- [ ] Reject unsupported file formats
- [ ] Display file preview correctly
- [ ] Analyze document and generate instructions
- [ ] Display system instructions in chat
- [ ] Verify civic guidance is relevant
- [ ] Check recommended actions are appropriate
- [ ] Test error messages display correctly
- [ ] Verify file upload works on different browsers
- [ ] Test with various document types (Aadhaar, PAN, Ration Card, etc.)

## Installation & Setup

### 1. Install Dependencies:
```bash
npm install
```

### 2. Build the Application:
```bash
npm run build
```

### 3. Deploy to Supabase:
The Edge Function is automatically deployed when you push to your Supabase project.

### 4. Test the Feature:
1. Start the development server: `npm run dev`
2. Navigate to Civic Life Companion
3. Upload a test document
4. Verify analysis results

## Support & Troubleshooting

### Issue: File upload button not working
- **Solution**: Check browser permissions for file access
- Ensure JavaScript is enabled

### Issue: PDF extraction failing
- **Solution**: Verify PDF is not encrypted
- Try converting to text-based PDF if scanned

### Issue: Analysis taking too long
- **Solution**: Check file size (should be < 10MB)
- Verify internet connection
- Try with a smaller file

### Issue: Incorrect civic guidance
- **Solution**: Ensure document contains relevant keywords
- Try uploading a different document
- Check if document is in supported language

## Code References

### Key Files:
- `src/components/CivicCompanion.tsx`: Frontend UI and file handling
- `src/utils/fileProcessor.ts`: File extraction utilities
- `src/supabase/functions/server/index.tsx`: Backend analysis endpoint

### Key Functions:
- `handleFileSelect()`: File selection handler
- `handleAnalyzeFile()`: Analysis trigger
- `extractTextFromFile()`: Main extraction function
- `generateSystemInstructions()`: Analysis and instruction generation

## Contact & Support

For issues or feature requests related to the file upload feature, please refer to the app's support channels or contact the development team.

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
