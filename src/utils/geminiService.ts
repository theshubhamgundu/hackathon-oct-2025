let GEMINI_API_KEY = '';

const initializeGemini = (): string => {
  if (GEMINI_API_KEY) return GEMINI_API_KEY;

  GEMINI_API_KEY = (import.meta.env?.VITE_GEMINI_API_KEY || '').trim();
  if (!GEMINI_API_KEY) {
    const userKey = prompt('Enter your Gemini API key (starts with AIza)');
    if (!userKey) throw new Error('Gemini API key required.');
    GEMINI_API_KEY = userKey.trim();
  }

  console.log('✅ Gemini API key initialized');
  return GEMINI_API_KEY;
};

// Call backend proxy for Groq API (ensures proper routing)
const callGroq = async (prompt: string): Promise<string> => {
  try {
    // First ensure API key is initialized
    initializeGemini();

    // Call backend proxy endpoint
    const response = await fetch('/api/groq/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    // Check status first before parsing JSON
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseErr) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textErr) {
          // If all else fails, use status code
        }
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error('Failed to parse response:', parseErr);
      const responseText = await response.text();
      throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
    }

    if (!data.text) {
      throw new Error('No text in response from AI');
    }

    console.log(`✅ Using model: ${data.model}`);
    return data.text;
  } catch (err: any) {
    console.error('Groq proxy error:', err);
    throw new Error(`Failed to get AI response: ${err.message}`);
  }
};

class GeminiCivicCompanion {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private model: any = null;

  private systemPrompt = `
You are JanAI – India's civic-tech assistant.
You help citizens understand government documents, find schemes, and file complaints.
Use clear, simple, and empathetic language.
If explaining complex forms or laws, break them into steps or plain English.
`;

  async sendMessage(userMessage: string): Promise<string> {
    try {
      this.conversationHistory.push({ role: 'user', content: userMessage });
      
      const conversationContext = this.conversationHistory.map(
        (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      const prompt = `${this.systemPrompt}\n\n${conversationContext}`;
      
      // Use Groq API via backend proxy
      const response = await callGroq(prompt);

      this.conversationHistory.push({ role: 'assistant', content: response });
      return response;
    } catch (err: any) {
      console.error('Groq API Error:', err);
      throw new Error(`AI failed: ${err.message}`);
    }
  }
}

export const civicCompanion = new GeminiCivicCompanion();
