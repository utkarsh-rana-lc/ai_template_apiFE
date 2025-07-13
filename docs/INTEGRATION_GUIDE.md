# Integration Guide

This comprehensive guide will help you integrate the WhatsApp Template AI Generator into your existing application.

## 🎯 **Overview**

The WhatsApp Template AI Generator consists of two main components:
1. **Frontend Component**: React-based form for template generation
2. **Backend API**: Serverless function for AI-powered content generation

## 🚀 **Quick Start**

### **1. Choose Your Integration Method**

| Method | Best For | Complexity | Setup Time |
|--------|----------|------------|------------|
| **Component Only** | React apps with existing backend | Low | 15 mins |
| **API Only** | Custom frontend, any backend | Medium | 30 mins |
| **Full Integration** | New projects, complete solution | High | 1 hour |

### **2. Prerequisites**

- ✅ Node.js 18+
- ✅ React 18+ (for frontend)
- ✅ OpenAI API Key
- ✅ Tailwind CSS (for styling)

## 📦 **Installation Methods**

### **Method 1: Copy Files (Recommended)**

1. **Copy the component files:**
```bash
# Copy frontend components
cp -r src/components/ your-project/src/components/
cp -r src/types/ your-project/src/types/

# Copy backend functions (if needed)
cp -r netlify/functions/ your-project/netlify/functions/
```

2. **Install dependencies:**
```bash
npm install lucide-react openai
```

3. **Set up environment variables:**
```bash
# .env
OPENAI_API_KEY=your_openai_api_key_here
```

### **Method 2: Git Submodule**

```bash
# Add as submodule
git submodule add https://github.com/yourusername/ai_template_WA.git ai-template-wa

# Update your imports
import { WhatsAppTemplateForm } from './ai-template-wa/src/components/WhatsAppTemplateForm';
```

### **Method 3: NPM Package (Future)**

```bash
npm install @yourorg/whatsapp-template-generator
```

## 🔧 **Frontend Integration**

### **Basic React Integration**

```tsx
// App.tsx
import React from 'react';
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function App() {
  const handleTemplateGenerated = (content: string) => {
    console.log('Generated template:', content);
    // Handle the generated content
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Template Generator</h1>
      <WhatsAppTemplateForm 
        onTemplateGenerated={handleTemplateGenerated}
        apiEndpoint="/api/generate_template"
      />
    </div>
  );
}

export default App;
```

### **Next.js Integration**

```tsx
// pages/template-generator.tsx
import { WhatsAppTemplateForm } from '../components/WhatsAppTemplateForm';

export default function TemplateGenerator() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <WhatsAppTemplateForm 
          apiEndpoint="/api/generate_template"
          onTemplateGenerated={(content) => {
            // Save to your database or state management
            console.log('Generated:', content);
          }}
        />
      </div>
    </div>
  );
}
```

### **Modal Integration**

```tsx
// TemplateModal.tsx
import { useState } from 'react';
import { WhatsAppTemplateForm } from './WhatsAppTemplateForm';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (content: string) => void;
}

export function TemplateModal({ isOpen, onClose, onTemplateSelect }: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Generate WhatsApp Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <WhatsAppTemplateForm 
          onTemplateGenerated={(content) => {
            onTemplateSelect(content);
            onClose();
          }}
          className="border-0 shadow-none"
        />
      </div>
    </div>
  );
}
```

## 🖥️ **Backend Integration**

### **Netlify Functions (Recommended)**

1. **Copy the function:**
```bash
mkdir -p netlify/functions
cp backend/functions/generate_template.mjs netlify/functions/
cp -r backend/utils netlify/
```

2. **Update package.json:**
```json
{
  "dependencies": {
    "openai": "^4.20.1"
  }
}
```

3. **Set environment variables in Netlify dashboard:**
```
OPENAI_API_KEY=your_openai_api_key_here
```

### **Express.js Integration**

```javascript
// routes/template.js
import express from 'express';
import { buildPrompt } from '../utils/prompt-builder.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/generate_template', async (req, res) => {
  try {
    const { category, goal, tone, language, variables = [] } = req.body;
    
    const prompt = buildPrompt(category, goal, tone, language, variables);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert WhatsApp template writer..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    res.json({
      content: response.choices[0].message.content.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

export default router;
```

### **API Gateway + Lambda**

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
      temperature: 0.7
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

## 🎨 **Styling Integration**

### **Tailwind CSS Setup**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Add path to the template generator components
  ],
  theme: {
    extend: {
      colors: {
        // Add your brand colors
        primary: '#00D4AA',
        secondary: '#00B896',
      }
    },
  },
  plugins: [],
}
```

### **Custom Styling**

```css
/* Custom styles for template generator */
.template-generator {
  --primary-color: #00D4AA;
  --secondary-color: #00B896;
  --border-radius: 8px;
}

.template-generator .generate-button {
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
}

.template-generator .generate-button:hover {
  background-color: var(--secondary-color);
}
```

## 🔄 **State Management Integration**

### **Redux Integration**

```typescript
// store/templateSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const generateTemplate = createAsyncThunk(
  'template/generate',
  async (templateData: TemplateRequest) => {
    const response = await fetch('/api/generate_template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    return response.json();
  }
);

const templateSlice = createSlice({
  name: 'template',
  initialState: {
    content: '',
    loading: false,
    error: null,
  },
  reducers: {
    clearTemplate: (state) => {
      state.content = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.content;
      })
      .addCase(generateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default templateSlice.reducer;
```

### **Context API Integration**

```tsx
// context/TemplateContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface TemplateContextType {
  generatedTemplate: string;
  setGeneratedTemplate: (template: string) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <TemplateContext.Provider value={{
      generatedTemplate,
      setGeneratedTemplate,
      isGenerating,
      setIsGenerating,
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within TemplateProvider');
  }
  return context;
}
```

## 🔒 **Security & Best Practices**

### **Environment Variables**

```bash
# Production
OPENAI_API_KEY=sk-prod-your-key-here
NODE_ENV=production

# Development
OPENAI_API_KEY=sk-dev-your-key-here
NODE_ENV=development
```

### **Rate Limiting**

```javascript
// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const templateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many template generation requests',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### **Input Validation**

```typescript
// utils/validation.ts
import { z } from 'zod';

export const templateRequestSchema = z.object({
  category: z.enum(['Marketing', 'Utility', 'Authentication']),
  goal: z.string().min(1).max(100),
  tone: z.enum(['Conversational', 'Informative', 'Persuasive', 'Promotional', 'Reassuring']),
  language: z.enum(['English', 'Hindi', 'Hinglish']),
  variables: z.array(z.string()).max(10),
});

export function validateTemplateRequest(data: unknown) {
  return templateRequestSchema.parse(data);
}
```

## 🧪 **Testing**

### **Component Testing**

```tsx
// __tests__/WhatsAppTemplateForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhatsAppTemplateForm } from '../components/WhatsAppTemplateForm';

// Mock fetch
global.fetch = jest.fn();

describe('WhatsAppTemplateForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders form fields', () => {
    render(<WhatsAppTemplateForm />);
    
    expect(screen.getByLabelText(/template type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/use case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
  });

  test('generates template on form submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: 'Generated template', success: true }),
    });

    render(<WhatsAppTemplateForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/template type/i), {
      target: { value: 'Marketing' }
    });
    fireEvent.change(screen.getByLabelText(/use case/i), {
      target: { value: 'Abandoned Cart' }
    });
    fireEvent.change(screen.getByLabelText(/language/i), {
      target: { value: 'English' }
    });
    fireEvent.change(screen.getByLabelText(/tone/i), {
      target: { value: 'Conversational' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/generate with ai/i));

    await waitFor(() => {
      expect(screen.getByText('Generated template')).toBeInTheDocument();
    });
  });
});
```

### **API Testing**

```javascript
// __tests__/api.test.js
import request from 'supertest';
import app from '../server.js';

describe('Template Generation API', () => {
  test('POST /api/generate_template - success', async () => {
    const templateData = {
      category: 'Marketing',
      goal: 'Abandoned Cart',
      tone: 'Conversational',
      language: 'English',
      variables: ['Customer Name', 'Product Name']
    };

    const response = await request(app)
      .post('/api/generate_template')
      .send(templateData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.content).toBeDefined();
    expect(typeof response.body.content).toBe('string');
  });

  test('POST /api/generate_template - validation error', async () => {
    const invalidData = {
      category: 'Invalid',
      // missing required fields
    };

    const response = await request(app)
      .post('/api/generate_template')
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });
});
```

## 📊 **Monitoring & Analytics**

### **Basic Logging**

```javascript
// utils/logger.js
export function logTemplateGeneration(data) {
  console.log('Template generated:', {
    category: data.category,
    goal: data.goal,
    language: data.language,
    timestamp: new Date().toISOString(),
    success: true
  });
}

export function logError(error, context) {
  console.error('Template generation error:', {
    error: error.message,
    context,
    timestamp: new Date().toISOString()
  });
}
```

### **Analytics Integration**

```javascript
// utils/analytics.js
export function trackTemplateGeneration(data) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'template_generated', {
      category: data.category,
      goal: data.goal,
      language: data.language
    });
  }

  // Custom analytics
  fetch('/api/analytics/template-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'template_generated',
      properties: data,
      timestamp: Date.now()
    })
  });
}
```

## 🚀 **Deployment**

### **Netlify Deployment**

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### **Vercel Deployment**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

## 🆘 **Troubleshooting**

### **Common Issues**

1. **API Key Not Working**
   - Verify the key is correctly set in environment variables
   - Check that the key has sufficient credits
   - Ensure no extra spaces in the key

2. **CORS Errors**
   - Add proper CORS headers to your API
   - Check that the frontend is calling the correct endpoint

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check that the component path is included in Tailwind's content array

4. **TypeScript Errors**
   - Verify all type definitions are imported
   - Check TypeScript version compatibility

### **Debug Mode**

```tsx
// Enable debug mode
<WhatsAppTemplateForm 
  onTemplateGenerated={(content) => {
    console.log('Debug - Generated content:', content);
    // Your handler
  }}
  apiEndpoint={process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/generate_template' : '/api/generate_template'}
/>
```

## 📞 **Support**

For integration support:
- 📖 Check the detailed documentation in `/docs`
- 🐛 Create an issue in the repository
- 💬 Contact the development team
- 📧 Email support (if available)

## 🔄 **Migration Guide**

If you're migrating from an existing template system:

1. **Backup existing templates**
2. **Map your current categories to the new system**
3. **Test the integration in a staging environment**
4. **Gradually migrate users to the new system**
5. **Monitor for any issues**

This integration guide should help you successfully integrate the WhatsApp Template AI Generator into your existing application. Choose the integration method that best fits your architecture and requirements.