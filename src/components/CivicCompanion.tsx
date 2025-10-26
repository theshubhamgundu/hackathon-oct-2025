import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, Upload, FileText, X, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { API_BASE_URL } from '../utils/supabase-client';
import { extractTextFromFile, validateFile } from '../utils/fileProcessor';
import { civicCompanion } from '../utils/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CivicCompanionProps {
  accessToken: string;
  onBack: () => void;
  initialQuery?: string;
}

export function CivicCompanion({ accessToken, onBack, initialQuery }: CivicCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m your Civic Life Companion. I can help you with:\n\n• Ration card applications\n• Aadhaar services\n• PAN card procedures\n• Passport applications\n• Driving license renewals\n• Municipal office information\n\nYou can also upload a PDF or document to analyze it and generate system instructions for civic services.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial voice query
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputMessage(initialQuery);
      // Auto-submit the voice query
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 500);
    }
  }, [initialQuery]);

  const handleFileSelect = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setUploadError('');

    try {
      // Extract text from file
      const extractedText = await extractTextFromFile(uploadedFile);

      // Create a user message showing file upload
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `📄 I've uploaded: ${uploadedFile.name}\n\nPlease analyze this document and explain it to me clearly.`,
        timestamp: new Date().toISOString()
      };

      setMessages((prev: Message[]) => [...prev, userMessage]);

      // Use Gemini AI for intelligent document analysis
      const analysis = await civicCompanion.analyzeDocument(extractedText, uploadedFile.name);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis,
        timestamp: new Date().toISOString()
      };

      setMessages((prev: Message[]) => [...prev, assistantMessage]);
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('File analysis error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error analyzing your document: ${error.message || 'Please try again.'}. Make sure the file is not corrupted and try uploading again.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatConversationalResponse = (systemInstructions: string): string => {
    // Convert system instructions into a conversational explanation
    let response = "Great! I've analyzed your document. Here's what I found:\n\n";
    
    // Extract key information from system instructions
    const lines = systemInstructions.split('\n').filter((line: string) => line.trim());
    
    let currentSection = '';
    let sectionContent: string[] = [];

    lines.forEach((line: string) => {
      if (line.includes('Document Classification')) {
        currentSection = 'classification';
      } else if (line.includes('Key Topics')) {
        if (sectionContent.length > 0) {
          response += formatSection(currentSection, sectionContent);
          sectionContent = [];
        }
        currentSection = 'topics';
      } else if (line.includes('Document Summary')) {
        if (sectionContent.length > 0) {
          response += formatSection(currentSection, sectionContent);
          sectionContent = [];
        }
        currentSection = 'summary';
      } else if (line.includes('Civic Guidance')) {
        if (sectionContent.length > 0) {
          response += formatSection(currentSection, sectionContent);
          sectionContent = [];
        }
        currentSection = 'guidance';
      } else if (line.includes('Recommended Actions')) {
        if (sectionContent.length > 0) {
          response += formatSection(currentSection, sectionContent);
          sectionContent = [];
        }
        currentSection = 'actions';
      } else if (line.trim() && !line.startsWith('#')) {
        sectionContent.push(line.trim());
      }
    });

    if (sectionContent.length > 0) {
      response += formatSection(currentSection, sectionContent);
    }

    response += "\n\nDo you have any questions about this document? I'm here to help explain anything in more detail!";
    return response;
  };

  const formatSection = (section: string, content: string[]): string => {
    if (content.length === 0) return '';

    switch (section) {
      case 'classification':
        return `**📋 About This Document:**\n${content.join('\n')}\n\n`;
      case 'topics':
        return `**🔍 Key Topics Found:**\n${content.join('\n')}\n\n`;
      case 'summary':
        return `**📝 Summary:**\n${content.join(' ')}\n\n`;
      case 'guidance':
        return `**💡 Here's What You Need to Know:**\n${content.join('\n')}\n\n`;
      case 'actions':
        return `**✅ What You Should Do:**\n${content.join('\n')}\n\n`;
      default:
        return `${content.join('\n')}\n\n`;
    }
  };

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use Gemini AI for intelligent response
      const response = await civicCompanion.sendMessage(messageToSend);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${error.message}. Please try again or rephrase your question.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'How can I apply for a new ration card?',
    'Where is the nearest Aadhaar update center?',
    'What documents are needed to update my PAN address?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2>Civic Life Companion</h2>
            <p className="text-sm text-gray-600">Your guide to government services</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white">
                <div className="p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Error */}
      {uploadError && (
        <div className="border-t border-red-200 bg-red-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-700">{uploadError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadError('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File Upload Preview */}
      {uploadedFile && (
        <div className="border-t border-blue-200 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{uploadedFile.name}</p>
                <p className="text-xs text-blue-700">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAnalyzeFile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about government services..."
              disabled={isLoading}
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload PDF, DOCX, DOC, or TXT file"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
