import React from 'react';
import WhatsAppTemplateForm from './WhatsAppTemplateForm';

interface WhatsAppTemplateGeneratorProps {
  onBack: () => void;
}

const WhatsAppTemplateGenerator: React.FC<WhatsAppTemplateGeneratorProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Create Template from Scratch</h1>
            <p className="text-sm text-gray-600">Generate a general-purpose WhatsApp template with AI assistance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <WhatsAppTemplateForm />
      </div>
    </div>
  );
};

export default WhatsAppTemplateGenerator;