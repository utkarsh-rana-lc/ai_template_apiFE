import React, { useState } from 'react';
import { Loader2, Sparkles, Check } from 'lucide-react';

interface FormData {
  useCase: string;
  language: string;
  tone: string;
  variables: string[];
}

const AIAssistantPanel: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    useCase: '',
    language: '',
    tone: '',
    variables: []
  });

  const [generatedBody, setGeneratedBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCases = [
    'Abandoned Cart',
    'Order Confirmation',
    'Delivery Reminder',
    'COD Confirmation',
    'Sale Offer',
    'Custom'
  ];

  const languages = ['English (US)', 'Hindi', 'Hinglish'];
  
  const tones = [
    'Conversational',
    'Informative',
    'Persuasive',
    'Promotional',
    'Reassuring'
  ];

  const availableVariables = [
    'Customer Name',
    'Product Name',
    'Order ID',
    'Delivery Date',
    'Discount Code'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVariableToggle = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter(v => v !== variable)
        : [...prev.variables, variable]
    }));
  };

  const generateTemplate = async () => {
    if (!formData.useCase || !formData.language || !formData.tone) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/generate_template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();
      setGeneratedBody(data.body || '');
    } catch (err) {
      // Fallback to mock data for demo purposes
      const mockBodies = {
        'Abandoned Cart': 'Hi {{1}}, you left {{2}} in your cart! Complete your purchase now and get it delivered by {{4}}. Don\'t miss out!',
        'Order Confirmation': 'Hi {{1}}, your order {{3}} has been confirmed! Your {{2}} will be delivered by {{4}}. Thank you for shopping with us.',
        'Delivery Reminder': 'Hi {{1}}, your order {{3}} containing {{2}} will be delivered today by {{4}}. Please be available to receive it.',
        'COD Confirmation': 'Hi {{1}}, please confirm your COD order {{3}} for {{2}} worth ₹{{5}}. Reply YES to confirm or NO to cancel.',
        'Sale Offer': 'Hi {{1}}, special offer just for you! Get {{5}} off on {{2}}. Limited time offer - shop now!',
        'Custom': 'Hi {{1}}, we have an important update regarding your {{2}}. Please check your account for more details.'
      };
      
      setGeneratedBody(mockBodies[formData.useCase as keyof typeof mockBodies] || 'Your template has been generated successfully.');
    } finally {
      setIsLoading(false);
    }
  };

  const useTemplate = () => {
    // Emit event or call parent function to autofill the body field
    const event = new CustomEvent('useTemplate', { 
      detail: { body: generatedBody } 
    });
    window.dispatchEvent(event);
    
    // For demo purposes, show success message
    alert('Template body has been applied to the form!');
  };

  const renderVariablePlaceholder = (text: string) => {
    return text.replace(/\{\{(\d+)\}\}/g, (match, number) => {
      const variableMap: { [key: string]: string } = {
        '1': 'Customer Name',
        '2': 'Product Name',
        '3': 'Order ID',
        '4': 'Delivery Date',
        '5': 'Discount Code'
      };
      
      const variableName = variableMap[number] || `Variable ${number}`;
      return `<span class="inline-flex items-center px-2 py-1 mx-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">${variableName}</span>`;
    });
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Template Generator</h2>
          <p className="text-sm text-gray-600">Generate WhatsApp template body content with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Form Inputs */}
        <div className="space-y-6">
          {/* Use Case */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Use Case *
            </label>
            <select
              value={formData.useCase}
              onChange={(e) => handleInputChange('useCase', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select use case</option>
              {useCases.map(useCase => (
                <option key={useCase} value={useCase}>{useCase}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the primary purpose of this template</p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select language</option>
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the language for your template</p>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Tone *
            </label>
            <select
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select tone</option>
              {tones.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the tone for the message</p>
          </div>

          {/* Variables */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Variables
            </label>
            <div className="space-y-2">
              {availableVariables.map(variable => (
                <label key={variable} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.variables.includes(variable)}
                    onChange={() => handleVariableToggle(variable)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">{variable}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select variables to include in your template</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateTemplate}
            disabled={isLoading}
            className="w-full bg-[#00B386] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#009973] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Template...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Template
              </>
            )}
          </button>
        </div>

        {/* Right Side - AI Output */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Generated Template Body
            </label>
            
            {generatedBody ? (
              <div className="space-y-4">
                {/* WhatsApp-like Preview */}
                <div className="bg-[#E3F2FD] p-4 rounded-2xl rounded-bl-md max-w-sm">
                  <div 
                    className="text-sm text-gray-800 leading-relaxed font-['system-ui']"
                    dangerouslySetInnerHTML={{ 
                      __html: renderVariablePlaceholder(generatedBody) 
                    }}
                  />
                </div>

                {/* Use Template Button */}
                <button
                  onClick={useTemplate}
                  className="w-full bg-[#00B386] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#009973] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Use This Template
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Fill out the form and click "Generate Template" to see your AI-generated WhatsApp template body here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;