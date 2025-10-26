import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - using environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDyWxedxF8CNO8kYWTfqr8ikb7X2IqXQkw';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GeminiCivicCompanion {
  private conversationHistory: ConversationMessage[] = [];
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
