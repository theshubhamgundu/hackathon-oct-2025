import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - using environment variable
let GEMINI_API_KEY = '';
let genAI: GoogleGenerativeAI | null = null;

// Get API key from environment or prompt user
const initializeGemini = (): GoogleGenerativeAI => {
  if (genAI && GEMINI_API_KEY) {
    return genAI;
  }

  // Try to get from environment
  const envKey = (import.meta.env as any).VITE_GEMINI_API_KEY || '';
  
  if (envKey && envKey.trim()) {
    GEMINI_API_KEY = envKey.trim();
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini API initialized from environment');
    return genAI;
  }
  
  // Fallback: prompt user to provide API key
  const userKey = prompt(
    '🔑 Please enter your Google Gemini API key\n\n' +
    'Get it free from: https://makersuite.google.com/app/apikey\n\n' +
    'Your key should start with "AIza"'
  );
  
  if (!userKey || !userKey.trim()) {
    throw new Error('API key is required. Get one from https://makersuite.google.com/app/apikey');
  }
  
  GEMINI_API_KEY = userKey.trim();
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini API initialized from user input');
  return genAI;
};

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GeminiCivicCompanion {
  private conversationHistory: ConversationMessage[] = [];
  private model: any = null;

  private systemPrompt = `You are an expert Civic Life Companion AI assistant for Indian citizens. Your role is to:

1. Help users understand government services, schemes, and procedures
2. Provide clear, step-by-step guidance on civic matters
3. Explain documents related to government services
4. Answer questions about Aadhaar, PAN, Ration Card, Passport, Driving License, etc.
5. Guide users through application processes
6. Provide information about government schemes and benefits
7. Help with complaint filing procedures

Important guidelines:
- Always respond in the same language the user is speaking
- Be conversational and friendly
- Break down complex procedures into simple steps
- Provide relevant links and resources when applicable
- Ask clarifying questions if needed
- Be empathetic and supportive
- Focus on practical, actionable advice

When analyzing documents:
- Explain what the document is about
- Identify key information
- Provide guidance on what to do next
- Highlight important dates or deadlines
- Suggest related services or documents needed`;

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Initialize model if not already done
      if (!this.model) {
        const ai = initializeGemini();
        // Use gemini-1.5-flash (free tier model) or fallback to gemini-pro
        const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
        let modelInitialized = false;
        
        for (const modelName of models) {
          try {
            this.model = ai.getGenerativeModel({ model: modelName });
            console.log(`✅ Using model: ${modelName}`);
            modelInitialized = true;
            break;
          } catch (e) {
            console.log(`⚠️ Model ${modelName} not available, trying next...`);
          }
        }
        
        if (!modelInitialized) {
          throw new Error('No compatible Gemini model available. Please check your API key.');
        }
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Build conversation context
      const conversationContext = this.conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Create the prompt with system context
      const fullPrompt = `${this.systemPrompt}\n\n--- Conversation History ---\n${conversationContext}`;

      // Get response from Gemini
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      return response;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  }

  async analyzeDocument(documentContent: string, fileName: string): Promise<string> {
    try {
      // Initialize model if not already done
      if (!this.model) {
        const ai = initializeGemini();
        // Use gemini-1.5-flash (free tier model) or fallback to gemini-pro
        const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
        let modelInitialized = false;
        
        for (const modelName of models) {
          try {
            this.model = ai.getGenerativeModel({ model: modelName });
            console.log(`✅ Using model: ${modelName}`);
            modelInitialized = true;
            break;
          } catch (e) {
            console.log(`⚠️ Model ${modelName} not available, trying next...`);
          }
        }
        
        if (!modelInitialized) {
          throw new Error('No compatible Gemini model available. Please check your API key.');
        }
      }

      const analysisPrompt = `Please analyze the following government document and provide a clear explanation:

Document Name: ${fileName}

Document Content:
${documentContent}

Please provide:
1. What this document is about
2. Key information and important details
3. What the user needs to do with this document
4. Any deadlines or time-sensitive information
5. Related documents or services they might need
6. Step-by-step guidance if applicable`;

      const result = await this.model.generateContent(analysisPrompt);
      const analysis = result.response.text();

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: `I've uploaded a document: ${fileName}`
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: analysis
      });

      return analysis;
    } catch (error: any) {
      console.error('Document analysis error:', error);
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }
}

// Export singleton instance
export const civicCompanion = new GeminiCivicCompanion();
