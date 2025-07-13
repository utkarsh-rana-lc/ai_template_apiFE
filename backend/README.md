# Backend Integration Guide

This guide explains how to integrate the WhatsApp Template Generator API into your existing backend infrastructure.

## 🏗️ **Architecture Overview**

The backend consists of:
- **Serverless Function**: Main API endpoint for template generation
- **Prompt Builder**: Utility for creating context-aware AI prompts
- **OpenAI Integration**: GPT-4o-mini for content generation

## 📁 **File Structure**

```
backend/
├── functions/
│   └── generate_template.mjs    # Main API endpoint
├── utils/
│   └── prompt-builder.js        # Enhanced prompt generation logic
└── README.md                    # This file
```

## 🚀 **Deployment Options**

### **Option 1: Netlify Functions (Recommended)**
1. Copy the `functions/` folder to your Netlify project
2. Set environment variables in Netlify dashboard
3. Deploy automatically with your site

### **Option 2: Vercel Functions**
```javascript
// api/generate_template.js
import { buildPrompt } from '../utils/prompt-builder.js';
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildPrompt(
      req.body.category,
      req.body.goal,
      req.body.tone,
      req.body.language,
      req.body.variables || []
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert WhatsApp template writer..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
      top_p: 0.95,
      frequency_penalty: 0.2,
      presence_penalty: 0.4
    });

    res.status(200).json({
      content: response.choices[0].message.content.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      content: 'Error generating template. Please try again.',
      success: false
    });
  }
}
```

### **Option 3: AWS Lambda**
```javascript
// lambda/generate_template.js
import { buildPrompt } from './utils/prompt-builder.js';
import OpenAI from 'openai';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables || []
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert WhatsApp template writer..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: response.choices[0].message.content.trim(),
        success: true
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        success: false
      })
    };
  }
};
```

### **Option 4: Express.js Server**
```javascript
// server.js
import express from 'express';
import cors from 'cors';
import { buildPrompt } from './utils/prompt-builder.js';
import OpenAI from 'openai';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/generate_template', async (req, res) => {
  try {
    const { category, goal, tone, language, variables = [] } = req.body;
    
    if (!category || !goal || !tone || !language) {
      return res.status(400).json({
        error: 'Missing required fields',
        content: 'Please fill in all required fields.'
      });
    }

    const prompt = buildPrompt(category, goal, tone, language, variables);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert WhatsApp template writer..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
      top_p: 0.95,
      frequency_penalty: 0.2,
      presence_penalty: 0.4
    });

    res.json({
      content: response.choices[0].message.content.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      content: 'Error generating template. Please try again.',
      success: false
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔧 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT models | Yes |

### **Setting Environment Variables**

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI key

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI key

**AWS Lambda:**
1. Go to Lambda Function → Configuration → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI key

**Local Development:**
```bash
# .env file
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 📡 **API Reference**

### **POST /api/generate_template**

Generates a WhatsApp template based on provided parameters.

**Request Body:**
```json
{
  "category": "Marketing",
  "goal": "Abandoned Cart",
  "tone": "Conversational",
  "language": "English",
  "variables": ["Customer Name", "Product Name", "Order ID"]
}
```

**Response:**
```json
{
  "content": "Hi {{1}}! 👋\n\nYou left {{2}} in your cart! 🛒\n\nComplete your purchase now and get it delivered by {{3}}. Don't miss out! ✨\n\nHappy shopping! 🛍️",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Missing required fields",
  "content": "Error generating template. Please try again.",
  "success": false
}
```

## 🎯 **Enhanced AI Features**

### **Improved Prompt Engineering**
- **Context-aware prompts** for each use case
- **Strategic emoji placement** guidelines
- **Proper formatting** instructions
- **Brand-friendly** content generation

### **AI Model Configuration**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",           // More capable model
  messages: [...],
  max_tokens: 300,                // Sufficient for templates
  temperature: 0.8,               // Creative but controlled
  top_p: 0.95,                   // Focused sampling
  frequency_penalty: 0.2,         // Reduce repetition
  presence_penalty: 0.4           // Encourage variety
});
```

### **Content Quality Features**
- **3-5 strategic emojis** per message
- **Proper line breaks** (`\n\n` for paragraphs)
- **Structured content** flow
- **Context-specific** language patterns
- **Meta compliance** built-in

## 🔒 **Security Considerations**

### **API Key Protection**
- Never expose OpenAI API key in frontend code
- Use environment variables for all sensitive data
- Implement rate limiting to prevent abuse

### **Input Validation**
```javascript
function validateRequest(body) {
  const required = ['category', 'goal', 'tone', 'language'];
  const missing = required.filter(field => !body[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate enum values
  const validCategories = ['Marketing', 'Utility', 'Authentication'];
  if (!validCategories.includes(body.category)) {
    throw new Error('Invalid category');
  }
  
  return true;
}
```

### **Rate Limiting**
```javascript
// Express.js example with rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## 🧪 **Testing**

### **Unit Tests**
```javascript
// test/prompt-builder.test.js
import { buildPrompt } from '../utils/prompt-builder.js';

describe('Prompt Builder', () => {
  test('should generate valid prompt with emojis', () => {
    const prompt = buildPrompt(
      'Marketing',
      'Abandoned Cart',
      'Conversational',
      'English',
      ['Customer Name', 'Product Name']
    );
    
    expect(prompt).toContain('Template Category: Marketing');
    expect(prompt).toContain('EMOJI STRATEGY');
    expect(prompt).toContain('FORMATTING REQUIREMENTS');
  });
});
```

### **Integration Tests**
```javascript
// test/api.test.js
import request from 'supertest';
import app from '../server.js';

describe('Template Generation API', () => {
  test('should generate template with proper formatting', async () => {
    const response = await request(app)
      .post('/api/generate_template')
      .send({
        category: 'Marketing',
        goal: 'Abandoned Cart',
        tone: 'Conversational',
        language: 'English',
        variables: ['Customer Name', 'Product Name']
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.content).toContain('{{1}}');
    expect(response.body.content).toContain('\n');
  });
});
```

## 📊 **Monitoring & Logging**

### **Enhanced Logging**
```javascript
function logTemplateGeneration(data, result) {
  console.log('Template generated:', {
    category: data.category,
    goal: data.goal,
    language: data.language,
    contentLength: result.length,
    emojiCount: (result.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
    lineBreaks: (result.match(/\n/g) || []).length,
    timestamp: new Date().toISOString(),
    success: true
  });
}
```

### **Error Tracking**
```javascript
function logError(error, context) {
  console.error('Template generation error:', {
    error: error.message,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });
}
```

## 🚀 **Performance Optimization**

### **Caching Strategy**
```javascript
// Simple in-memory cache for serverless
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(requestData) {
  return JSON.stringify(requestData);
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}
```

## 📞 **Support**

For backend integration support:
- Check the API Reference documentation
- Review the example implementations
- Create an issue in the repository