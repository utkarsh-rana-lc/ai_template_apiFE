import React, { useState } from 'react';
import TemplateTypeSelector from './TemplateTypeSelector';
import WhatsAppTemplateForm from './WhatsAppTemplateForm';
import ProductAwareTemplateModal from './ProductAwareTemplateModal';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'selector' | 'scratch' | 'product-aware'>('selector');
  const [insertedTemplates, setInsertedTemplates] = useState<Array<{content: string, product?: string}>>([]);

  const handleTemplateGenerated = (content: string) => {
    setInsertedTemplates(prev => [...prev, { content }]);
    console.log('Template generated:', content);
  };

  const handleProductTemplateInsert = (content: string, productName: string) => {
    setInsertedTemplates(prev => [...prev, { content, product: productName }]);
    console.log(`Product template inserted for ${productName}:`, content);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
  };

  if (currentView === 'selector') {
    return (
      <TemplateTypeSelector 
        onSelectType={(type) => setCurrentView(type)}
      />
    );
  }

  if (currentView === 'scratch') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={handleBackToSelector}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Template Types
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Template from Scratch
            </h1>
            <p className="text-gray-600">
              Generate a general-purpose WhatsApp template with AI assistance
            </p>
          </div>

          <WhatsAppTemplateForm 
            onTemplateGenerated={handleTemplateGenerated}
          />

          {/* Generated Templates Display */}
          {insertedTemplates.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Generated Templates ({insertedTemplates.length})
              </h2>
              <div className="space-y-4">
                {insertedTemplates.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        Template #{index + 1}
                        {template.product && ` - ${template.product}`}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {template.product ? 'Product-Aware' : 'General'}
                      </span>
                    </div>
                    
                    {/* WhatsApp-style preview */}
                    <div className="bg-[#E3F2FD] rounded-2xl rounded-bl-md p-4 max-w-sm">
                      <pre className="whitespace-pre-line text-sm text-gray-800 leading-relaxed font-['system-ui']">
                        {template.content}
                      </pre>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(template.content)}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setInsertedTemplates(prev => prev.filter((_, i) => i !== index))}
                        className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'product-aware') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={handleBackToSelector}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Template Types
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Product-Aware Template Generator
            </h1>
            <p className="text-gray-600 mb-8">
              Generate personalized WhatsApp templates for specific products with AI
            </p>
            
            {/* Demo Button */}
            <ProductAwareTemplateModal
              isOpen={true}
              onClose={handleBackToSelector}
              onInsert={handleProductTemplateInsert}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MainApp;