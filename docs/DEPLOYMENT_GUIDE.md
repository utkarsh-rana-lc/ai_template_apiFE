# Deployment Guide

This guide covers deploying the WhatsApp Template AI Generator to various platforms and environments.

## 🎯 **Deployment Overview**

The project consists of two main components:
1. **Frontend**: React application (static files)
2. **Backend**: Serverless functions for AI generation

## 🚀 **Platform-Specific Deployments**

### **1. Netlify (Recommended)**

Netlify provides seamless deployment with built-in serverless functions.

#### **Setup Steps**

1. **Connect Repository**
```bash
# Push your code to GitHub/GitLab
git add .
git commit -m "Deploy AI Template WA"
git push origin main
```

2. **Configure Build Settings**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/.netlify/functions/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Set Environment Variables**
- Go to Site Settings → Environment Variables
- Add: `OPENAI_API_KEY` = `your_openai_api_key`

4. **Deploy**
```bash
# Manual deployment
npm run build
netlify deploy --prod --dir=dist

# Or connect GitHub for auto-deployment
```

#### **Netlify Functions Structure**
```
netlify/
└── functions/
    └── generate_template.mjs
```

### **2. Vercel**

Vercel offers excellent Next.js support and serverless functions.

#### **Setup Steps**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure Project**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

3. **Create API Routes**
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
      temperature: 0.7
    });

    res.status(200).json({
      content: response.choices[0].message.content.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
}
```

4. **Deploy**
```bash
# Set environment variables
vercel env add OPENAI_API_KEY

# Deploy
vercel --prod
```

### **3. AWS (Lambda + S3 + CloudFront)**

For enterprise-scale deployments with AWS infrastructure.

#### **Setup Steps**

1. **Install AWS CLI and Serverless Framework**
```bash
npm install -g serverless
npm install -g aws-cli
```

2. **Configure Serverless**
```yaml
# serverless.yml
service: whatsapp-template-generator

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  generateTemplate:
    handler: lambda/generate_template.handler
    events:
      - http:
          path: api/generate_template
          method: post
          cors: true

resources:
  Resources:
    # S3 bucket for static files
    StaticSiteBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-static-site
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: index.html
    
    # CloudFront distribution
    CloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      Properties:
        DistributionConfig:
          Origins:
            - DomainName: !GetAtt StaticSiteBucket.DomainName
              Id: S3Origin
              S3OriginConfig:
                OriginAccessIdentity: ""
          DefaultCacheBehavior:
            TargetOriginId: S3Origin
            ViewerProtocolPolicy: redirect-to-https
```

3. **Lambda Function**
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

4. **Deploy**
```bash
# Build frontend
npm run build

# Deploy backend
serverless deploy

# Upload frontend to S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

### **4. Google Cloud Platform**

Using Cloud Functions and Cloud Storage.

#### **Setup Steps**

1. **Install Google Cloud CLI**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init
```

2. **Configure Cloud Function**
```javascript
// functions/generate_template/index.js
import { buildPrompt } from './utils/prompt-builder.js';
import OpenAI from 'openai';

export const generateTemplate = async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
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
      temperature: 0.7
    });

    res.status(200).json({
      content: response.choices[0].message.content.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
};
```

3. **Deploy**
```bash
# Deploy Cloud Function
gcloud functions deploy generateTemplate \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_key

# Deploy static files to Cloud Storage
gsutil -m cp -r dist/* gs://your-bucket-name/
```

## 🔧 **Environment Configuration**

### **Environment Variables**

Create environment-specific configurations:

```bash
# .env.production
OPENAI_API_KEY=sk-prod-your-production-key
NODE_ENV=production
API_BASE_URL=https://your-domain.com/api

# .env.staging
OPENAI_API_KEY=sk-dev-your-staging-key
NODE_ENV=staging
API_BASE_URL=https://staging.your-domain.com/api

# .env.development
OPENAI_API_KEY=sk-dev-your-development-key
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
```

### **Build Scripts**

```json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "deploy:netlify": "npm run build && netlify deploy --prod",
    "deploy:vercel": "npm run build && vercel --prod",
    "deploy:aws": "npm run build && serverless deploy"
  }
}
```

## 🔒 **Security Configuration**

### **CORS Setup**

```javascript
// Netlify Function
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};
```

### **Rate Limiting**

```javascript
// Simple rate limiting for serverless
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimitStore.get(ip);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
```

### **API Key Security**

```javascript
// Validate API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Validate API key format
if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}
```

## 📊 **Monitoring & Logging**

### **Basic Logging**

```javascript
// Structured logging
function logRequest(event, context) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    method: event.httpMethod,
    path: event.path,
    userAgent: event.headers['User-Agent'],
    ip: event.requestContext.identity.sourceIp
  }));
}

function logError(error, context) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    error: error.message,
    stack: error.stack
  }));
}
```

### **Health Checks**

```javascript
// Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    // Check OpenAI API connectivity
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.models.list();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
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

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

### **Bundle Optimization**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

## 🔄 **CI/CD Pipeline**

### **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### **GitLab CI**

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: node:$NODE_VERSION
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist
  environment:
    name: production
    url: https://your-domain.com
  only:
    - main
```

## 🧪 **Testing in Production**

### **Smoke Tests**

```javascript
// tests/smoke.test.js
describe('Production Smoke Tests', () => {
  const API_BASE = process.env.API_BASE_URL || 'https://your-domain.com/api';

  test('API health check', async () => {
    const response = await fetch(`${API_BASE}/health`);
    expect(response.status).toBe(200);
  });

  test('Template generation works', async () => {
    const response = await fetch(`${API_BASE}/generate_template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Marketing',
        goal: 'Sale Offer',
        tone: 'Promotional',
        language: 'English',
        variables: ['Customer Name']
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.content).toBeDefined();
  });
});
```

## 📞 **Deployment Support**

### **Rollback Strategy**

```bash
# Netlify rollback
netlify sites:list
netlify api listSiteDeploys --site-id=your-site-id
netlify api restoreSiteDeploy --site-id=your-site-id --deploy-id=previous-deploy-id

# Vercel rollback
vercel list
vercel rollback your-deployment-url

# AWS rollback
serverless deploy --stage production --package .serverless-previous
```

### **Monitoring Checklist**

- ✅ API response times < 5 seconds
- ✅ Error rate < 1%
- ✅ OpenAI API key has sufficient credits
- ✅ CORS headers are correctly set
- ✅ Rate limiting is working
- ✅ Environment variables are set
- ✅ SSL certificates are valid

This deployment guide covers the major platforms and considerations for deploying the WhatsApp Template AI Generator. Choose the platform that best fits your infrastructure and requirements.