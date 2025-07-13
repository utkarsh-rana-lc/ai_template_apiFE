# WhatsApp Template AI Generator

A React component and API service for generating Meta-compliant WhatsApp Business templates using OpenAI's GPT models.

## 🎯 **Project Overview**

This project provides an AI-powered solution for generating WhatsApp Business API templates that comply with Meta's messaging policies. It consists of a React frontend component and a serverless backend API that can be easily integrated into existing applications.

### **What It Does**
- Generates contextual WhatsApp template content using AI
- Ensures Meta compliance for different template categories
- Supports multiple languages (English, Hindi, Hinglish)
- Provides tone-specific content generation
- Includes strategic emoji usage for brand engagement
- Handles variable placeholders for dynamic content

### **Key Features**
- ✅ Meta-compliant template generation
- 🎨 Multiple tone options (Conversational, Informative, Persuasive, etc.)
- 🌍 Multi-language support
- 📱 Strategic emoji integration
- 🔧 Easy integration with existing codebases
- ⚡ Serverless architecture (Netlify Functions)
- 🎯 Context-aware content for different use cases

---

## 📁 **Project Structure**

```
whatsapp-template-ai-generator/
├── frontend/                          # React Frontend Component
│   ├── components/
│   │   └── WhatsAppTemplateForm.tsx   # Main form component
│   ├── types/
│   │   └── index.ts                   # TypeScript definitions
│   └── README.md                      # Frontend integration guide
├── backend/                           # Serverless API
│   ├── functions/
│   │   └── generate_template.mjs      # Netlify function
│   ├── utils/
│   │   └── prompt-builder.js          # AI prompt generation logic
│   └── README.md                      # Backend integration guide
├── docs/                              # Documentation
│   ├── INTEGRATION_GUIDE.md           # Step-by-step integration
│   ├── API_REFERENCE.md               # API documentation
│   └── DEPLOYMENT_GUIDE.md            # Deployment instructions
├── examples/                          # Integration examples
│   ├── react-integration/             # React app example
│   ├── nextjs-integration/            # Next.js example
│   └── vanilla-js-integration/        # Vanilla JS example
└── package.json                       # Dependencies and scripts
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- OpenAI API Key
- React 18+ (for frontend integration)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd whatsapp-template-ai-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

---

## 🔧 **Integration Options**

### **Option 1: Component Integration (Recommended)**
Import the React component directly into your existing React application.

### **Option 2: API Integration**
Use just the backend API and build your own frontend interface.

### **Option 3: Full Integration**
Integrate both frontend and backend into your existing infrastructure.

---

## 📚 **Documentation**

- **[Integration Guide](./docs/INTEGRATION_GUIDE.md)** - Step-by-step integration instructions
- **[API Reference](./docs/API_REFERENCE.md)** - Complete API documentation
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deployment instructions for different platforms
- **[Frontend README](./frontend/README.md)** - Frontend component documentation
- **[Backend README](./backend/README.md)** - Backend API documentation

---

## 🛠 **Tech Stack**

### **Frontend**
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)

### **Backend**
- Node.js
- OpenAI API (GPT-4o-mini)
- Netlify Functions (serverless)

### **Development**
- Vite (build tool)
- ESLint (linting)
- PostCSS (CSS processing)

---

## 🔐 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT models | Yes |

---

## 📝 **Usage Example**

```tsx
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function App() {
  return (
    <div className="container mx-auto p-4">
      <WhatsAppTemplateForm 
        onTemplateGenerated={(content) => {
          console.log('Generated template:', content);
        }}
      />
    </div>
  );
}
```

---

## 🎨 **Template Quality Features**

### **Strategic Emoji Usage**
- 3-5 contextual emojis per message
- Use case-specific emoji selection
- Brand-friendly visual appeal
- Professional yet engaging tone

### **Proper Formatting**
- Clear line breaks and paragraph separation
- Structured content flow
- Visual hierarchy with spacing
- Mobile-optimized readability

### **Context Awareness**
- Industry-specific language patterns
- Tone-appropriate messaging
- Cultural sensitivity for different languages
- Compliance with Meta's guidelines

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 🆘 **Support**

For integration support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

## 🔄 **Version History**

- **v1.0.0** - Initial release with AI template generation
- **v1.1.0** - Added emoji support and improved prompts
- **v1.2.0** - Enhanced multi-language support
- **v1.3.0** - Improved content quality and formatting
