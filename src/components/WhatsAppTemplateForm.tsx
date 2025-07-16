import React, { useState } from 'react';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  category: string; // This will be the Meta category
  templateCategory: string; // This will be the new Category field
  templateType: string; // This will be the new Template Type field
  carouselCards: string;
  goal: string;
  language: string;
  tone: string;
  variables: string[];
  header: string;
  footer: string;
  addButtons: boolean;
  buttonConfig: ButtonConfig;
}

interface ButtonConfig {
  type: 'CTA' | 'Quick Reply';
  subtype?: 'Static URL' | 'Dynamic URL' | 'Copy Code' | 'Phone Number';
  text: string;
  url?: string;
  phone?: string;
}

const WhatsAppTemplateForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    templateCategory: '',
    templateType: '',
    carouselCards: '2',
    goal: '',
    language: '',
    tone: '',
    variables: [],
    header: '',
    footer: '',
    addButtons: false,
    buttonConfig: {
      type: 'CTA',
      subtype: 'Static URL',
      text: '',
      url: ''
    }
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

  const categories = [
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Utility', label: 'Utility' },
    { value: 'Authentication', label: 'Authentication' }
  ];

  const templateTypeOptions = [
    { value: 'Text', label: 'Text' },
    { value: 'Image', label: 'Image' },
    { value: 'Video', label: 'Video' },
    { value: 'Document', label: 'Document' },
    { value: 'Carousel', label: 'Carousel' },
    { value: 'Limited Time Offer', label: 'Limited Time Offer' }
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
    if (!formData.templateCategory) {
      setError('Please select a category');
      return false;
    }
    if (!formData.templateType) {
      setError('Please select a template type');
      return false;
    }
    if (!formData.category) {
      setError('Please select a Meta template category');
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
      console.log('Sending request to API with data:', {
        category: formData.category,
        goal: formData.goal,
        tone: formData.tone,
        language: formData.language,
        variables: formData.variables,
      });

      // Use Netlify function endpoint
      const apiUrl = '/.netlify/functions/generate_template';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          template_category: formData.templateCategory,
          template_type: formData.templateType,
          goal: formData.goal,        // This is the "Use Case" selected in the UI
          tone: formData.tone,
          language: formData.language,
          variables: formData.variables,
          carousel_cards: formData.carouselCards,
          header: formData.header,
          footer: formData.footer,
          add_buttons: formData.addButtons,
          button_config: formData.addButtons ? formData.buttonConfig : null
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.content) {
        console.log('Generated content:', data.content);
        setGeneratedContent(data.content);
        setSuccess(true);
      } else {
        console.error('No content in response:', data);
        throw new Error('No content received from API');
      }
    } catch (err) {
      console.error('API Error:', err);
      
      // Fallback to mock data for demo purposes
      console.log('Using fallback mock data for demo');
      const mockTemplates = {
        'Abandoned Cart': `Hi {{1}}, you left {{2}} in your cart! 🛒\n\nComplete your purchase now and get it delivered by {{4}}. Don't miss out on this amazing deal!\n\nClick here to complete your order: [Link]`,
        'Order Confirmation': `Hi {{1}}, great news! 🎉\n\nYour order {{3}} has been confirmed. Your {{2}} will be delivered by {{4}}.\n\nThank you for choosing us!`,
        'Delivery Reminder': `Hi {{1}}, your order is on its way! 🚚\n\nOrder {{3}} containing {{2}} will be delivered today by {{4}}. Please be available to receive it.\n\nTrack your order: [Link]`,
        'COD Confirmation': `Hi {{1}}, please confirm your Cash on Delivery order.\n\nOrder ID: {{3}}\nProduct: {{2}}\nAmount: ₹{{5}}\n\nReply YES to confirm or NO to cancel.`,
        'Sale Offer': `Hi {{1}}, exclusive offer just for you! 🎁\n\nGet {{5}} off on {{2}}. Limited time offer - don't miss out!\n\nShop now: [Link]`,
        'Custom': `Hi {{1}}, we have an important update regarding your {{2}}.\n\nPlease check your account for more details or contact our support team.\n\nThank you!`
      };
      
      const mockContent = mockTemplates[formData.goal as keyof typeof mockTemplates] || 
        `Hi {{1}}, thank you for your interest in {{2}}. We'll get back to you soon!`;
      
      setGeneratedContent(mockContent);
      setSuccess(true);
      setError('API temporarily unavailable - using demo content');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      templateCategory: '',
      templateType: '',
      carouselCards: '2',
      goal: '',
      language: '',
      tone: '',
      variables: [],
      header: '',
      footer: '',
      addButtons: false,
      buttonConfig: {
        type: 'CTA',
        subtype: 'Static URL',
        text: '',
        url: ''
      }
    });
    setGeneratedContent('');
    setError(null);
    setSuccess(false);
  };

  const regenerateTemplate = async () => {
    await generateTemplate();
  };

  const insertInBody = () => {
    // Emit event or call parent function to insert the generated content
    const event = new CustomEvent('insertTemplate', { 
      detail: { content: generatedContent } 
    });
    window.dispatchEvent(event);
    
    // For demo purposes, show success message
    alert('Template content has been inserted into the body field!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Template Generator</h1>
        <p className="text-gray-600">Create Meta-compliant WhatsApp templates using AI</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); generateTemplate(); }} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the category for this template</p>
          <select
            value={formData.templateCategory}
            onChange={(e) => handleInputChange('templateCategory', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose category...</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Template Type <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the type of template</p>
          <select
            value={formData.templateType}
            onChange={(e) => handleInputChange('templateType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose template type...</option>
            {templateTypeOptions.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Carousel Cards Count */}
        {formData.templateType === 'Carousel' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Number of Cards in Carousel <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">Select number of cards (2-10)</p>
            <select
              value={formData.carouselCards || '2'}
              onChange={(e) => handleInputChange('carouselCards', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
              required
            >
              {[2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num} Cards</option>
              ))}
            </select>
          </div>
        )}

        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Meta Template Category <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the Meta template category</p>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose Meta category...</option>
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

        {/* Header */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Header (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">Add a header to your template</p>
          <input
            type="text"
            value={formData.header}
            onChange={(e) => handleInputChange('header', e.target.value)}
            placeholder="e.g., Special Offer, Important Update"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
          />
        </div>

        {/* Footer */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Footer (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">Add a footer to your template</p>
          <input
            type="text"
            value={formData.footer}
            onChange={(e) => handleInputChange('footer', e.target.value)}
            placeholder="e.g., Thank you for choosing us, Contact support"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
          />
        </div>

        {/* Add Buttons Toggle */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.addButtons}
              onChange={(e) => handleInputChange('addButtons', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            <span className="text-sm font-medium text-gray-900">Add Buttons to Template?</span>
          </label>

          {formData.addButtons && (
            <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Type</label>
                <select
                  value={formData.buttonConfig.type}
                  onChange={(e) => handleInputChange('buttonConfig', {...formData.buttonConfig, type: e.target.value as 'CTA' | 'Quick Reply'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="CTA">CTA</option>
                  <option value="Quick Reply">Quick Reply</option>
                </select>
              </div>

              {formData.buttonConfig.type === 'CTA' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Subtype</label>
                  <select
                    value={formData.buttonConfig.subtype}
                    onChange={(e) => handleInputChange('buttonConfig', {...formData.buttonConfig, subtype: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Static URL">Static URL</option>
                    <option value="Dynamic URL">Dynamic URL</option>
                    <option value="Copy Code">Copy Code</option>
                    <option value="Phone Number">Phone Number</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonConfig.text}
                  onChange={(e) => handleInputChange('buttonConfig', {...formData.buttonConfig, text: e.target.value})}
                  placeholder="e.g., Shop Now, Call Us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {formData.buttonConfig.type === 'CTA' && formData.buttonConfig.subtype?.includes('URL') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={formData.buttonConfig.url || ''}
                    onChange={(e) => handleInputChange('buttonConfig', {...formData.buttonConfig, url: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              {formData.buttonConfig.type === 'CTA' && formData.buttonConfig.subtype === 'Phone Number' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.buttonConfig.phone || ''}
                    onChange={(e) => handleInputChange('buttonConfig', {...formData.buttonConfig, phone: e.target.value})}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
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
              onClick={regenerateTemplate}
              disabled={isLoading}
              className="px-6 py-3 border border-[#00D4AA] text-[#00D4AA] rounded-lg hover:bg-[#00D4AA] hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Regenerate
            </button>
          )}
        </div>
      </form>

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="mt-8 p-6 bg-[#e5ddd5] rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Template Preview</h3>
          
          {/* WhatsApp Message Container */}
          <div className="bg-white rounded-lg shadow-sm max-w-sm ml-auto relative">
            {/* Header Section */}
            {formData.header && (
              <div className="bg-gray-100 px-3 py-2 rounded-t-lg border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">{formData.header}</div>
              </div>
            )}
            
            {/* Media Section (if template type is Image/Video) */}
            {(formData.templateType === 'Image' || formData.templateType === 'Video') && (
              <div className="bg-black rounded-t-lg h-24 flex items-center justify-center relative">
                <div className="text-white text-2xl">
                  {formData.templateType === 'Video' ? '▶' : '🖼️'}
                </div>
                {formData.templateType === 'Video' && (
                  <div className="absolute bottom-1 right-1 text-white text-xs">0:15</div>
                )}
              </div>
            )}
            
            {/* Document Section */}
            {formData.templateType === 'Document' && (
              <div className="bg-gray-100 rounded-t-lg h-16 flex items-center justify-center relative border-b">
                <div className="text-gray-600 text-lg">📄</div>
                <div className="ml-2 text-sm text-gray-700">Document.pdf</div>
              </div>
            )}
            
            {/* Carousel Section */}
            {formData.templateType === 'Carousel' && (
              <div className="bg-gray-100 rounded-t-lg h-20 flex items-center justify-center relative border-b">
                <div className="flex space-x-2">
                  {Array.from({length: parseInt(formData.carouselCards || '2')}, (_, i) => (
                    <div key={i} className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                      <span className="text-xs text-gray-500">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-1 right-1 text-xs text-gray-600">
                  {formData.carouselCards} cards
                </div>
              </div>
            )}
            
            {/* Message Content */}
            <div className="p-3">
              <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line text-left">
                {generatedContent}
              </div>
              
              {/* Footer */}
              {formData.footer && (
                <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
                  {formData.footer}
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-xs text-gray-500 text-right mt-2">
                1:04 AM
              </div>
            </div>
          </div>
          
          {/* Buttons (Outside message bubble) */}
          {formData.addButtons && formData.buttonConfig && formData.buttonConfig.text && (
            <div className="mt-2 space-y-1 max-w-sm ml-auto">
              <button className="w-full bg-white border border-gray-300 text-blue-600 py-2 px-4 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
                {formData.buttonConfig.text}
              </button>
            </div>
          )}
          
          {/* Insert in Body CTA */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={insertInBody}
              className="bg-[#00D4AA] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00B896] transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              Insert in Body
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateForm;