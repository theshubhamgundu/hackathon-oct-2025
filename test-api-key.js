#!/usr/bin/env node

// Test script to check which Gemini models are available for your API key

const fs = require('fs');
const path = require('path');

// Read API key from .env.local
let apiKey = '';
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match) {
      apiKey = match[1].trim();
      console.log('✅ API key loaded from .env.local');
    }
  }
} catch (err) {
  console.error('❌ Could not read .env.local');
}

if (!apiKey) {
  console.error('❌ API key not found. Please set VITE_GEMINI_API_KEY in .env.local');
  process.exit(1);
}

console.log(`\n📝 Testing API key: ${apiKey.substring(0, 10)}...\n`);

// Test each model
const models = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
  'gemini-1.0-pro'
];

async function testModel(model) {
  try {
    console.log(`🔄 Testing ${model}...`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
        }),
      }
    );

    if (response.ok) {
      console.log(`✅ ${model} - AVAILABLE\n`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${model} - NOT AVAILABLE`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${error.substring(0, 100)}\n`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ${model} - ERROR: ${err.message}\n`);
    return false;
  }
}

async function testAllModels() {
  console.log('Testing Gemini models...\n');
  
  let available = [];
  for (const model of models) {
    const isAvailable = await testModel(model);
    if (isAvailable) {
      available.push(model);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (available.length > 0) {
    console.log(`✅ Available models: ${available.join(', ')}`);
    console.log('\n💡 Update src/server/geminiProxy.ts to use:');
    console.log(`const MODELS = ['${available.join("', '")}'];`);
  } else {
    console.log('❌ No models available for this API key');
    console.log('\n💡 Possible solutions:');
    console.log('1. Check API key is valid (starts with AIza)');
    console.log('2. Enable Generative Language API:');
    console.log('   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    console.log('3. Check your Google Cloud project has quota');
    console.log('4. Try a different API key from https://ai.google.dev');
  }
  console.log('='.repeat(50) + '\n');
}

testAllModels().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
