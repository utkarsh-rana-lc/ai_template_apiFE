// Example: Basic React Integration
import React, { useState } from 'react';
import { WhatsAppTemplateForm } from '../../frontend/components/WhatsAppTemplateForm';

function App() {
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleTemplateGenerated = (content: string) => {
    setGeneratedTemplate(content);
    console.log('Template generated:', content);
    
    // You can now:
    // 1. Save to your database
    // 2. Update your application state
    // 3. Show in a preview
    // 4. Send to WhatsApp Business API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          WhatsApp Template Generator Demo
        </h1>
        
        {/* Basic Integration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Integration</h2>
          <WhatsAppTemplateForm 
            onTemplateGenerated={handleTemplateGenerated}
            apiEndpoint="/api/generate_template"
          />
        </div>

        {/* Generated Template Display */}
        {generatedTemplate && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Generated Template</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {generatedTemplate}
              </pre>
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 flex gap-4">
              <button 
                onClick={() => navigator.clipboard.writeText(generatedTemplate)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy Template
              </button>
              <button 
                onClick={() => setGeneratedTemplate('')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Modal Integration Example */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Modal Integration</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Open Template Generator Modal
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Generate WhatsApp Template</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <WhatsAppTemplateForm 
                onTemplateGenerated={(content) => {
                  handleTemplateGenerated(content);
                  setShowModal(false);
                }}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;