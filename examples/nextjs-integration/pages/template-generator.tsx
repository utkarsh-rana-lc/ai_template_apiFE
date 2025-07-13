// Example: Next.js Integration
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { WhatsAppTemplateForm } from '../../frontend/components/WhatsAppTemplateForm';

interface TemplateGeneratorProps {
  apiEndpoint: string;
}

export default function TemplateGenerator({ apiEndpoint }: TemplateGeneratorProps) {
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateGenerated = (content: string) => {
    // Add to templates list
    setTemplates(prev => [content, ...prev]);
    setSelectedTemplate(content);
    
    // Save to localStorage for persistence
    const savedTemplates = JSON.parse(localStorage.getItem('whatsapp-templates') || '[]');
    savedTemplates.unshift(content);
    localStorage.setItem('whatsapp-templates', JSON.stringify(savedTemplates.slice(0, 10))); // Keep last 10
  };

  const saveTemplate = async (template: string) => {
    try {
      // Save to your database
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: template })
      });
      
      if (response.ok) {
        alert('Template saved successfully!');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Template Generator */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">WhatsApp Template Generator</h1>
            <WhatsAppTemplateForm 
              onTemplateGenerated={handleTemplateGenerated}
              apiEndpoint={apiEndpoint}
            />
          </div>

          {/* Templates History */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Generated Templates</h2>
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border">
                  <div className="text-sm text-gray-600 mb-2">
                    Template #{templates.length - index}
                  </div>
                  <div className="text-sm bg-gray-50 p-3 rounded mb-3">
                    <pre className="whitespace-pre-wrap">
                      {template.substring(0, 100)}
                      {template.length > 100 && '...'}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Full
                    </button>
                    <button
                      onClick={() => saveTemplate(template)}
                      className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(template)}
                      className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No templates generated yet.
                  <br />
                  Use the form to generate your first template!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Template Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Template Preview</h3>
                  <button 
                    onClick={() => setSelectedTemplate('')}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* WhatsApp-like preview */}
                <div className="bg-[#E3F2FD] p-4 rounded-2xl rounded-bl-md max-w-sm mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-['system-ui']">
                    {selectedTemplate}
                  </pre>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedTemplate)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy Template
                  </button>
                  <button
                    onClick={() => saveTemplate(selectedTemplate)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      apiEndpoint: process.env.API_ENDPOINT || '/api/generate_template'
    }
  };
};