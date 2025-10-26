# File Upload Feature - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                   (CivicCompanion Component)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Chat Messages Display                                   │   │
│  │  - User messages                                         │   │
│  │  - Assistant responses                                   │   │
│  │  - System instructions                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  File Upload Section                                     │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Upload Button (📤) → File Input Dialog             │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ File Preview Panel (if file selected)              │ │   │
│  │  │ - File name                                        │ │   │
│  │  │ - File size                                        │ │   │
│  │  │ - Analyze button                                   │ │   │
│  │  │ - Cancel button                                    │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Error Display (if validation fails)                │ │   │
│  │  │ - Error message                                    │ │   │
│  │  │ - Dismiss button                                   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Input Area                                          │ │   │
│  │  │ - Text input for chat                              │ │   │
│  │  │ - Upload button                                    │ │   │
│  │  │ - Send button                                      │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FILE PROCESSING LAYER                         │
│                    (fileProcessor.ts)                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ validateFile()                                           │   │
│  │ - Check file type (PDF, DOCX, DOC, TXT)                │   │
│  │ - Check file size (max 10MB)                            │   │
│  │ - Return validation result                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ extractTextFromFile()                                    │   │
│  │ - Route to appropriate extractor                        │   │
│  │ - Handle errors                                         │   │
│  │ - Return extracted text                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↙              ↓              ↘                          │
│    PDF              DOCX              TXT                        │
│    ↓                 ↓                 ↓                         │
│  extractTextFromPDF  extractTextFromDOCX  file.text()           │
│  (pdf.js)           (mammoth)                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│              (Supabase Edge Function)                            │
│                                                                   │
│  POST /make-server-8457b97f/analyze-document                    │
│                                                                   │
│  Request:                                                        │
│  {                                                               │
│    "documentContent": "extracted text...",                      │
│    "fileName": "document.pdf"                                   │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  ANALYSIS ENGINE                                 │
│              (Backend Analysis Functions)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ generateSystemInstructions()                             │   │
│  │ - Main orchestration function                            │   │
│  │ - Calls all analysis functions                           │   │
│  │ - Formats output                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Document Classification                                  │   │
│  │ - Detect: Government Doc, Scheme, Service Guide, Policy │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ extractKeyTopics()                                       │   │
│  │ - Search for civic service keywords                      │   │
│  │ - Extract relevant sentences                             │   │
│  │ - Return top 10 topics                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ extractDocumentSummary()                                 │   │
│  │ - Extract first 3 sentences                              │   │
│  │ - Filter by length                                       │   │
│  │ - Return summary                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ generateCivicGuidance()                                  │   │
│  │ - Match content to civic services                        │   │
│  │ - Generate relevant guidance                             │   │
│  │ - Include helpful links                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ generateActionItems()                                    │   │
│  │ - Determine action type (apply, renew, verify, etc.)    │   │
│  │ - Generate step-by-step actions                          │   │
│  │ - Return numbered list                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RESPONSE                                    │
│                                                                   │
│  {                                                               │
│    "systemInstructions": "# Civic Life Companion...",          │
│    "timestamp": "2024-01-15T10:30:00.000Z"                     │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                               │
│                                                                   │
│  - Add user message to chat                                      │
│  - Add system instructions as assistant message                  │
│  - Display in formatted markdown                                 │
│  - User can scroll and read full instructions                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Selects    │
│   File      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│  File Validation        │
│  - Format check         │
│  - Size check           │
└──────┬──────────────────┘
       │
       ├─ Invalid ──→ Show Error Message
       │
       ├─ Valid ──→ ┌──────────────────┐
       │            │ Show File Preview │
       │            └────────┬──────────┘
       │                     │
       │                     ↓
       │            ┌──────────────────┐
       │            │ User Clicks      │
       │            │ Analyze          │
       │            └────────┬──────────┘
       │                     │
       ↓                     ↓
┌──────────────────────────────────────┐
│  Extract Text from File              │
│  - PDF: pdf.js extraction            │
│  - DOCX: mammoth extraction          │
│  - TXT: direct read                  │
└──────┬───────────────────────────────┘
       │
       ├─ Error ──→ Show Error Message
       │
       ├─ Success ──→ ┌──────────────────────┐
       │              │ Send to API          │
       │              │ /analyze-document    │
       │              └────────┬─────────────┘
       │                       │
       ↓                       ↓
┌──────────────────────────────────────┐
│  Backend Analysis                    │
│  - Classify document                 │
│  - Extract topics                    │
│  - Generate summary                  │
│  - Create guidance                   │
│  - Generate actions                  │
└──────┬───────────────────────────────┘
       │
       ├─ Error ──→ Show Error Message
       │
       ├─ Success ──→ ┌──────────────────────┐
       │              │ Return Instructions  │
       │              └────────┬─────────────┘
       │                       │
       ↓                       ↓
┌──────────────────────────────────────┐
│  Display Results                     │
│  - Add to chat history               │
│  - Format as markdown                │
│  - Show in message bubble            │
│  - User can read and follow          │
└──────────────────────────────────────┘
```

## Component Interaction Diagram

```
CivicCompanion.tsx
│
├─ State Management
│  ├─ messages: Message[]
│  ├─ inputMessage: string
│  ├─ uploadedFile: File | null
│  ├─ uploadError: string
│  └─ fileInputRef: React.Ref
│
├─ Event Handlers
│  ├─ handleFileSelect()
│  │  └─ calls validateFile()
│  │
│  ├─ handleAnalyzeFile()
│  │  ├─ calls extractTextFromFile()
│  │  └─ calls fetch(/analyze-document)
│  │
│  └─ handleSendMessage()
│     └─ calls fetch(/chat)
│
├─ UI Components
│  ├─ Header
│  ├─ Messages Display
│  ├─ Error Panel
│  ├─ File Preview Panel
│  └─ Input Area
│
└─ Dependencies
   ├─ fileProcessor.ts
   │  ├─ validateFile()
   │  ├─ extractTextFromFile()
   │  ├─ extractTextFromPDF()
   │  ├─ extractTextFromDOCX()
   │  └─ extractTextFromDOC()
   │
   └─ API Endpoints
      ├─ /chat
      └─ /analyze-document
```

## File Processing Pipeline

```
Input File
    │
    ├─ PDF (.pdf)
    │  │
    │  ├─ pdf.js loads file
    │  ├─ Iterate through pages
    │  ├─ Extract text from each page
    │  └─ Combine text
    │
    ├─ DOCX (.docx)
    │  │
    │  ├─ mammoth reads file
    │  ├─ Parse document structure
    │  ├─ Extract all text
    │  └─ Return combined text
    │
    ├─ DOC (.doc)
    │  │
    │  └─ Recommend conversion to .docx
    │
    └─ TXT (.txt)
       │
       └─ Direct file.text() read

    ↓
    
Extracted Text
    │
    ├─ Clean and normalize
    ├─ Remove extra whitespace
    ├─ Preserve structure
    └─ Return to frontend

    ↓

Send to API
    │
    └─ POST /analyze-document
       ├─ documentContent: string
       └─ fileName: string
```

## Analysis Engine Pipeline

```
Document Content
    │
    ├─ Classification Detection
    │  ├─ Check for "government" keywords
    │  ├─ Check for "scheme" keywords
    │  ├─ Check for "procedure" keywords
    │  └─ Check for "policy" keywords
    │
    ├─ Topic Extraction
    │  ├─ Search civic service keywords
    │  │  ├─ Aadhaar, PAN, Passport, etc.
    │  │  └─ Certificates, IDs, etc.
    │  │
    │  ├─ Extract relevant sentences
    │  │  ├─ Split by punctuation
    │  │  ├─ Filter by length
    │  │  └─ Limit to 10 topics
    │  │
    │  └─ Return topic list
    │
    ├─ Summary Generation
    │  ├─ Extract first 3 sentences
    │  ├─ Filter by length (20-150 chars)
    │  └─ Return summary
    │
    ├─ Guidance Generation
    │  ├─ Match content to services
    │  │  ├─ Aadhaar → UIDAI guidance
    │  │  ├─ PAN → NSDL guidance
    │  │  ├─ Passport → Passport India guidance
    │  │  └─ Schemes → PM Schemes guidance
    │  │
    │  └─ Return formatted guidance
    │
    └─ Action Items Generation
       ├─ Detect action type
       │  ├─ Application → Apply steps
       │  ├─ Renewal → Renewal steps
       │  ├─ Scheme → Eligibility steps
       │  └─ General → General steps
       │
       └─ Return numbered actions

    ↓

System Instructions
    │
    ├─ Document Classification
    ├─ Key Topics
    ├─ Document Summary
    ├─ Civic Guidance
    └─ Recommended Actions

    ↓

Return to Frontend
    │
    └─ Display in Chat
```

## Error Handling Flow

```
File Upload
    │
    ├─ Validation Error
    │  ├─ Invalid format
    │  │  └─ Show: "Unsupported file format..."
    │  │
    │  └─ File too large
    │     └─ Show: "File size exceeds 10MB..."
    │
    ├─ Extraction Error
    │  ├─ PDF corrupted
    │  │  └─ Show: "Error analyzing document..."
    │  │
    │  ├─ DOCX parsing failed
    │  │  └─ Show: "Error analyzing document..."
    │  │
    │  └─ File read error
    │     └─ Show: "Error analyzing document..."
    │
    ├─ API Error
    │  ├─ Authentication failed
    │  │  └─ Show: "Unauthorized"
    │  │
    │  ├─ Server error
    │  │  └─ Show: "Failed to analyze document"
    │  │
    │  └─ Network error
    │     └─ Show: "Error analyzing document..."
    │
    └─ Success
       └─ Display system instructions
```

## State Transitions

```
Initial State
    │
    ├─ uploadedFile: null
    ├─ uploadError: ""
    └─ isLoading: false

    ↓

User Selects File
    │
    ├─ If invalid
    │  ├─ uploadedFile: null
    │  ├─ uploadError: "error message"
    │  └─ isLoading: false
    │
    └─ If valid
       ├─ uploadedFile: File
       ├─ uploadError: ""
       └─ isLoading: false

    ↓

User Clicks Analyze
    │
    ├─ uploadedFile: File
    ├─ uploadError: ""
    └─ isLoading: true

    ↓

Analysis Complete
    │
    ├─ uploadedFile: null
    ├─ uploadError: ""
    └─ isLoading: false

    ↓

Results Displayed
    │
    └─ Ready for next upload
```

---

This architecture ensures a smooth, efficient flow from file upload through analysis to result display, with comprehensive error handling at each stage.
