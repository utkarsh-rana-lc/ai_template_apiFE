import React, { useState } from 'react';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { FormData, TemplateFormProps } from '../types';

const WhatsAppTemplateForm: React.FC<TemplateFormProps> = ({ 
  onTemplateGenerated,
  apiEndpoint = '/api/generate_template',
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    goal: '',
    language: '',
    tone: '',
    variables: []
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const templateTypes = [
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Utility', label: 'Utility' },
    { value: 'Authentication', label: 'Authentication' }
  ];

  const useCases = [
    { value: 'Abandoned Cart', label: 'Abandoned Cart' },
    { value: 'Order Confirmation', label: 'Order Confirmation' },
    { value: 'Delivery Reminder', label: 'Delivery Reminder' },
    { value: 'COD Confirmation', label: 'COD Confirmation' },
    { value: 'Sale Offer', label: 'Sale Offer' },
    { value: 'Custom', label: 'Custom' }
  ];

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' }
  ];

  const tones = [
    { value: 'Conversational', label: 'Conversational' },
    { value: 'Informative', label: 'Informative' },
    { value: 'Persuasive', label: 'Persuasive' },
    { value: 'Promotional', label: 'Promotional' },
    { value: 'Reassuring', label: 'Reassuring' }
  ];

  const availableVariables = [
    { value: 'Customer Name', label: 'Customer Name' },
    { value: 'Product Name', label: 'Product Name' },
    { value: 'Order ID', label: 'Order ID' },
    { value: 'Delivery Date', label: 'Delivery Date' },
    { value: 'Discount Code', label: 'Discount Code' }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleVariableToggle = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter(v => v !== variable)
        : [...prev.variables, variable]
    }));
    setError(null);
    setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.category) {
      setError('Please select a template type');
      return false;
    }
    if (!formData.goal) {
      setError('Please choose a use case');
      return false;
    }
    if (!formData.language) {
      setError('Please select a language');
      return false;
    }
    if (!formData.tone) {
      setError('Please select a tone');
      return false;
    }
    return true;
  };

  const generateTemplate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setGeneratedContent('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          goal: formData.goal,
          tone: formData.tone,
          language: formData.language,
          variables: formData.variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content) {
        setGeneratedContent(data.content);
        setSuccess(true);
        
        // Call the callback function if provided
        if (onTemplateGenerated) {
          onTemplateGenerated(data.content);
        }
      } else {
        throw new Error('No content received from API');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to generate template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      goal: '',
      language: '',
      tone: '',
      variables: []
    });
    setGeneratedContent('');
    setError(null);
    setSuccess(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Template Generator</h1>
        <p className="text-gray-600">Create Meta-compliant WhatsApp templates using AI</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); generateTemplate(); }} className="space-y-6">
        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Template Type <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the template type (as per Meta)</p>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose template type...</option>
            {templateTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Use Case */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Use Case <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Choose the primary purpose of this template</p>
          <select
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose use case...</option>
            {useCases.map(useCase => (
              <option key={useCase.value} value={useCase.value}>{useCase.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Language <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the language for your template</p>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose language...</option>
            {languages.map(language => (
              <option key={language.value} value={language.value}>{language.label}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tone <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the tone for the message</p>
          <select
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose tone...</option>
            {tones.map(tone => (
              <option key={tone.value} value={tone.value}>{tone.label}</option>
            ))}
          </select>
        </div>

        {/* Variables */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Variables
          </label>
          <p className="text-sm text-gray-600 mb-3">Select variables to include in your template</p>
          <div className="space-y-3">
            {availableVariables.map(variable => (
              <label key={variable.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.variables.includes(variable.value)}
                  onChange={() => handleVariableToggle(variable.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <span className="text-sm text-gray-700 font-medium">{variable.label}</span>
              </label>
            ))}
          </div>
          
          {formData.variables.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Selected Variables:</p>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map(variable => (
                  <span
                    key={variable}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">Template generated successfully!</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#00D4AA] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00B896] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate with AI
              </>
            )}
          </button>
          
          {generatedContent && (
            <button
              type="button"
              onClick={generateTemplate}
              disabled={isLoading}
              className="px-6 py-3 border border-[#00D4AA] text-[#00D4AA] rounded-lg hover:bg-[#00D4AA] hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Regenerate
            </button>
          )}
          
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Template Content</h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateForm;
export { WhatsAppTemplateForm };