# Frontend Integration Guide

This guide explains how to integrate the WhatsApp Template Generator React component into your existing application.

## 📦 **Installation**

### **Option 1: Copy Component Files**
1. Copy the `components/` and `types/` folders to your project
2. Install required dependencies:
```bash
npm install lucide-react
```

### **Option 2: NPM Package (Future)**
```bash
npm install whatsapp-template-generator
```

## 🚀 **Basic Usage**

### **Simple Integration**
```tsx
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function App() {
  return (
    <div className="container mx-auto p-4">
      <WhatsAppTemplateForm />
    </div>
  );
}
```

### **With Callback Handler**
```tsx
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function App() {
  const handleTemplateGenerated = (content: string) => {
    console.log('Generated template:', content);
    // Handle the generated content (save to state, send to API, etc.)
  };

  return (
    <WhatsAppTemplateForm 
      onTemplateGenerated={handleTemplateGenerated}
      apiEndpoint="/your-api-endpoint"
      className="custom-styling"
    />
  );
}
```

## 🔧 **Props Reference**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onTemplateGenerated` | `(content: string) => void` | `undefined` | Callback when template is generated |
| `apiEndpoint` | `string` | `/api/generate_template` | API endpoint for template generation |
| `className` | `string` | `''` | Additional CSS classes |

## 🎨 **Styling**

The component uses Tailwind CSS classes. Ensure Tailwind is configured in your project:

### **Tailwind Config**
```js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add path to the component files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### **Custom Styling**
You can override styles by passing a `className` prop or by customizing the Tailwind classes directly in the component.

## 📱 **Responsive Design**

The component is fully responsive and works on:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🔌 **Integration Examples**

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
            // Handle generated content
            console.log(content);
          }}
        />
      </div>
    </div>
  );
}
```

### **React Router Integration**
```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/template-generator" 
          element={<WhatsAppTemplateForm />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### **Modal Integration**
```tsx
import { useState } from 'react';
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';

function TemplateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState('');

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Generate Template
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <WhatsAppTemplateForm 
              onTemplateGenerated={(content) => {
                setGeneratedTemplate(content);
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

## 🔄 **State Management Integration**

### **Redux Integration**
```tsx
import { useDispatch } from 'react-redux';
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';
import { setGeneratedTemplate } from './store/templateSlice';

function TemplateGenerator() {
  const dispatch = useDispatch();

  return (
    <WhatsAppTemplateForm 
      onTemplateGenerated={(content) => {
        dispatch(setGeneratedTemplate(content));
      }}
    />
  );
}
```

### **Context API Integration**
```tsx
import { useContext } from 'react';
import { WhatsAppTemplateForm } from './components/WhatsAppTemplateForm';
import { TemplateContext } from './context/TemplateContext';

function TemplateGenerator() {
  const { setTemplate } = useContext(TemplateContext);

  return (
    <WhatsAppTemplateForm 
      onTemplateGenerated={setTemplate}
    />
  );
}
```

## 🛠 **Customization**

### **Custom Variables**
To add custom variables, modify the `availableVariables` array in the component:

```tsx
const availableVariables = [
  { value: 'Customer Name', label: 'Customer Name' },
  { value: 'Product Name', label: 'Product Name' },
  // Add your custom variables
  { value: 'Store Name', label: 'Store Name' },
  { value: 'Support Number', label: 'Support Number' },
];
```

### **Custom Use Cases**
Add custom use cases by modifying the `useCases` array:

```tsx
const useCases = [
  { value: 'Abandoned Cart', label: 'Abandoned Cart' },
  // Add your custom use cases
  { value: 'Welcome Message', label: 'Welcome Message' },
  { value: 'Feedback Request', label: 'Feedback Request' },
];
```

## 🎯 **Template Quality Features**

### **Enhanced Content Generation**
- **Strategic emoji usage** (3-5 per message)
- **Proper line breaks** and formatting
- **Context-aware** content for each use case
- **Brand-friendly** tone and style

### **Multi-language Support**
- **English**: Professional business communication
- **Hindi**: Respectful with proper honorifics
- **Hinglish**: Natural code-switching patterns

### **Compliance Features**
- **Meta policy compliance** built-in
- **Template category awareness**
- **Variable usage validation**
- **Character limit enforcement**

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Tailwind styles not working**
   - Ensure Tailwind CSS is properly configured
   - Check that the component path is included in Tailwind's content array

2. **API endpoint not found**
   - Verify the `apiEndpoint` prop points to your backend
   - Check that CORS is properly configured

3. **TypeScript errors**
   - Ensure all type definitions are imported
   - Check that your TypeScript version is compatible

### **Debug Mode**
Enable console logging to debug issues:

```tsx
<WhatsAppTemplateForm 
  onTemplateGenerated={(content) => {
    console.log('Generated content:', content);
    // Your handler logic
  }}
/>
```

## 📞 **Support**

For integration support:
- Check the main README.md
- Review the API documentation
- Create an issue in the repository