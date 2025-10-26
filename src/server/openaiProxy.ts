// Backend proxy for OpenAI API calls

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get API key from environment or .env file
let OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';

// If not in env, try to load from .env.local file
if (!OPENAI_API_KEY) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      console.log('📄 .env.local content:', envContent.substring(0, 50) + '...');
      const match = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
      if (match) {
        OPENAI_API_KEY = match[1].trim();
        console.log('✅ Loaded OpenAI API key from .env.local');
      } else {
        console.warn('⚠️ VITE_OPENAI_API_KEY not found in .env.local');
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not read .env.local file');
  }
}

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Rate limiting for free tier
let lastRequestTime = 0;
const REQUEST_DELAY_MS = 2000; // 2 second delay between requests

interface OpenAIRequest {
  prompt: string;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// POST /api/openai/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as OpenAIRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        hint: 'Set VITE_OPENAI_API_KEY in .env.local or environment',
      });
    }

    console.log(`📝 Processing prompt with OpenAI API key: ${OPENAI_API_KEY.substring(0, 10)}...`);

    // Rate limiting for free tier - wait between requests
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY_MS) {
      const waitTime = REQUEST_DELAY_MS - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();

    try {
      const response = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are JanAI – India's civic-tech assistant.
You help citizens understand government documents, find schemes, and file complaints.
Use clear, simple, and empathetic language.
If explaining complex forms or laws, break them into steps or plain English.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenAI API error: ${response.status}`);
        console.error(`Error details: ${errorText}`);
        return res.status(response.status).json({
          error: `OpenAI API error: ${response.status}`,
          details: errorText.substring(0, 200),
        });
      }

      let data: OpenAIResponse;
      try {
        data = (await response.json()) as OpenAIResponse;
      } catch (parseErr) {
        console.error('❌ Failed to parse OpenAI response');
        return res.status(500).json({
          error: 'Invalid response from OpenAI',
        });
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        console.warn('⚠️ OpenAI returned no text');
        return res.status(500).json({
          error: 'No response from OpenAI',
        });
      }

      console.log('✅ Success with OpenAI (gpt-3.5-turbo - Free Tier)');
      return res.json({
        success: true,
        model: 'gpt-3.5-turbo',
        text,
      });
    } catch (err: any) {
      console.error('❌ OpenAI request error:', err.message);
      return res.status(500).json({
        error: 'Failed to call OpenAI API',
        message: err.message,
      });
    }
  } catch (err: any) {
    console.error('❌ OpenAI proxy error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
});

// GET /api/openai/debug - Debug endpoint
router.get('/debug', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    apiKeyLoaded: !!OPENAI_API_KEY,
    apiKeyPreview: OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : 'not set',
    endpoint: OPENAI_ENDPOINT,
    model: 'gpt-3.5-turbo',
  });
});

export default router;
