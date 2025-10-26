import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set up PDF.js worker - use CDN as fallback
if (typeof window !== 'undefined') {
  // Try to use local worker first, fallback to CDN
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (e) {
    console.warn('PDF worker setup warning:', e);
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractTextFromDOC(file: File): Promise<string> {
  // For older .doc files, we'll use a basic approach
  // Note: Full .doc support requires additional libraries
  throw new Error('Legacy .doc format is not fully supported. Please use .docx format instead.');
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    return extractTextFromDOC(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error(`Unsupported file format: ${fileType || fileName}`);
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedFormats = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  const fileName = file.name.toLowerCase();
  const isSupportedByType = supportedFormats.includes(file.type);
  const isSupportedByExtension = ['.pdf', '.docx', '.doc', '.txt'].some(ext => fileName.endsWith(ext));

  if (!isSupportedByType && !isSupportedByExtension) {
    return { valid: false, error: 'Unsupported file format. Please use PDF, DOCX, DOC, or TXT' };
  }

  return { valid: true };
}
