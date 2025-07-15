import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ProductAwareTemplateModal from './ProductAwareTemplateModal';

const ProductAwareDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insertedTemplates, setInsertedTemplates] = useState<Array<{content: string, product: string}>>([]);

  const handleInsert = (content: string, productName: string) => {
    setInsertedTemplates(prev => [...prev, { content, product: productName }]);
    console.log(`Template inserted for ${productName}:`, content);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product-Aware WhatsApp Template Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Generate personalized WhatsApp templates for specific products with AI
          </p>
          
          {/* Demo Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-3 mx-auto shadow-lg"
          >
            <Sparkles className="w-6 h-6" />
            Generate with AI
          </button>
        </div>

        {/* Inserted Templates Display */}
        {insertedTemplates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Templates ({insertedTemplates.length})
            </h2>
            <div className="space-y-4">
              {insertedTemplates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Template for: {template.product}
                    </h3>
                    <span className="text-xs text-gray-500">
                      #{index + 1}
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

        {/* Feature Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Product Selection</h3>
            <p className="text-sm text-gray-600">
              Multi-select products with search functionality and "Select All" option
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Preview</h3>
            <p className="text-sm text-gray-600">
              Real-time WhatsApp-style previews for each selected product
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Enhancement</h3>
            <p className="text-sm text-gray-600">
              Context-aware AI generation with custom instructions and Meta compliance
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProductAwareTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsert}
      />
    </div>
  );
};

export default ProductAwareDemo;