// Backend proxy for Gemini API calls
// This ensures requests go directly to Google's Gemini endpoints

import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Get API key from environment or .env file
let GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';

// If not in env, try to load from .env.local file
if (!GEMINI_API_KEY) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
      if (match) {
        GEMINI_API_KEY = match[1].trim();
        console.log('✅ Loaded API key from .env.local');
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not read .env.local file');
  }
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models to try in order
const MODELS = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
  'gemini-1.0-pro'
];

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

const initializeGenAI = () => {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
};

interface GeminiRequest {
  prompt: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

// POST /api/gemini/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as GeminiRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_API_KEY) {
      console.error('❌ Gemini API key not configured');
      console.error('Environment variables:', {
        VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY ? '***' : 'not set',
        NODE_ENV: process.env.NODE_ENV,
        CWD: process.cwd(),
      });
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        hint: 'Set VITE_GEMINI_API_KEY in .env.local or environment'
      });
    }

    console.log(`📝 Processing prompt with API key: ${GEMINI_API_KEY.substring(0, 10)}...`);

    // Initialize Gemini AI
    const ai = initializeGenAI();
    if (!ai) {
      throw new Error('Failed to initialize Gemini AI');
    }

    // Try each model until one works
    for (const model of MODELS) {
      try {
        console.log(`🔄 Trying model: ${model}`);

        const genModel = ai.getGenerativeModel({ model });
        const result = await genModel.generateContent(prompt);
        const text = result.response.text();

        if (!text) {
          console.warn(`⚠️ Model ${model} returned no text`);
          continue;
        }

        console.log(`✅ Success with model: ${model}`);
        return res.json({
          success: true,
          model,
          text,
        });
      } catch (err: any) {
        console.warn(`⚠️ Model ${model} error:`, err.message);
        continue;
      }
    }

    // All models failed
    console.error('❌ All models failed for prompt');
    return res.status(503).json({
      error: 'All Gemini models unavailable',
      hint: 'Check API key at https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
    });
  } catch (err: any) {
    console.error('❌ Gemini proxy error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// GET /api/gemini/models - List available models
router.get('/models', async (req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `API returned ${response.status}`,
        details: errorText,
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Invalid JSON response from Gemini API',
      });
    }

    return res.json(data);
  } catch (err: any) {
    console.error('Error listing models:', err);
    return res.status(500).json({
      error: 'Failed to list models',
      message: err.message,
    });
  }
});

// GET /api/gemini/debug - Debug endpoint
router.get('/debug', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    apiKeyLoaded: !!GEMINI_API_KEY,
    apiKeyPreview: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'not set',
    endpoint: GEMINI_ENDPOINT,
    models: MODELS,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CWD: process.cwd(),
    },
  });
});

export default router;
