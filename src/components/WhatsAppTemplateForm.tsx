import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
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
    variables: [],
    templateType: 'Text'
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carousel and media state
  const [carouselType, setCarouselType] = useState<'Image' | 'Video'>('Image');
  const [carouselCards, setCarouselCards] = useState('2');
  const [carouselBodyContent, setCarouselBodyContent] = useState('');
  const [carouselCardContents, setCarouselCardContents] = useState<string[]>(['', '']);
  const [carouselCardButtons, setCarouselCardButtons] = useState<Array<{type: string, text: string}>>([
    {type: 'Quick Reply', text: ''},
    {type: 'Quick Reply', text: ''}
  ]);
  const [activeCardTab, setActiveCardTab] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // Regular button config (hidden for carousel)
  const [addButtons, setAddButtons] = useState(false);
  const [buttonConfig, setButtonConfig] = useState({
    type: 'CTA',
    subtype: 'Static URL',
    text: '',
    url: ''
  });

  const templateTypes = [
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

  // Update carousel card contents and buttons when card count changes
  useEffect(() => {
    const cardCount = parseInt(carouselCards);
    setCarouselCardContents(prev => {
      const newContents = [...prev];
      while (newContents.length < cardCount) {
        newContents.push('');
      }
      return newContents.slice(0, cardCount);
    });
    
    setCarouselCardButtons(prev => {
      const newButtons = [...prev];
      while (newButtons.length < cardCount) {
        newButtons.push({type: 'Quick Reply', text: ''});
      }
      return newButtons.slice(0, cardCount);
    });
    
    // Reset active tab if it's beyond the new card count
    if (activeCardTab >= cardCount) {
      setActiveCardTab(0);
    }
  }, [carouselCards, activeCardTab]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
    // Clear generated content when form changes to force regeneration
    setGeneratedContent('');
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
    // Clear generated content when variables change
    setGeneratedContent('');
  };

  const handleFileUpload = (file: File, type: 'video' | 'image' | 'document') => {
    if (type === 'video') {
      setVideoFile(file);
    } else if (type === 'image') {
      setImageFile(file);
    } else if (type === 'document') {
      setDocumentFile(file);
    }
  };

  const handleCarouselCardChange = (index: number, content: string) => {
    setCarouselCardContents(prev => {
      const newContents = [...prev];
      newContents[index] = content;
      return newContents;
    });
  };

  const handleCarouselButtonChange = (index: number, field: 'type' | 'text', value: string) => {
    setCarouselCardButtons(prev => {
      const newButtons = [...prev];
      newButtons[index] = { ...newButtons[index], [field]: value };
      return newButtons;
    });
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
    if (formData.templateType === 'Video' && !videoFile) {
      setError('Please upload a video file for Video template');
      return false;
    }
    if (formData.templateType === 'Image' && !imageFile) {
      setError('Please upload an image file for Image template');
      return false;
    }
    if (formData.templateType === 'Document' && !documentFile) {
      setError('Please upload a document file for Document template');
      return false;
    }
    if (formData.templateType === 'Carousel' && carouselType === 'Video' && !videoFile) {
      setError('Please upload a video file for Video Carousel');
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
      const requestData = {
        category: formData.category,
        goal: formData.goal,
        tone: formData.tone,
        language: formData.language,
        variables: formData.variables,
        templateType: formData.templateType,
        carouselType: formData.templateType === 'Carousel' ? carouselType : undefined,
        carouselCards: formData.templateType === 'Carousel' ? carouselCards : undefined,
        carouselBodyContent: formData.templateType === 'Carousel' ? carouselBodyContent : undefined,
        carouselCardContents: formData.templateType === 'Carousel' ? carouselCardContents : undefined,
        carouselCardButtons: formData.templateType === 'Carousel' ? carouselCardButtons : undefined
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content) {
        setGeneratedContent(data.content);
        setSuccess(true);
        
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
      variables: [],
      templateType: 'Text'
    });
    setGeneratedContent('');
    setError(null);
    setSuccess(false);
    setCarouselType('Image');
    setCarouselCards('2');
    setCarouselBodyContent('');
    setCarouselCardContents(['', '']);
    setCarouselCardButtons([
      {type: 'Quick Reply', text: ''},
      {type: 'Quick Reply', text: ''}
    ]);
    setActiveCardTab(0);
    setVideoFile(null);
    setImageFile(null);
    setDocumentFile(null);
    setAddButtons(false);
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
            value={formData.templateType}
            onChange={(e) => handleInputChange('templateType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose template type...</option>
            {templateTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Carousel Configuration - Show when Carousel is selected */}
        {formData.templateType === 'Carousel' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-orange-600 text-lg">•</span>
              <h3 className="text-lg font-bold text-gray-900">Configure Carousel Cards</h3>
              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">i</span>
              </div>
            </div>

            {/* Carousel Configuration Grid - 4 columns */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Number of Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No of Cards</label>
                <select
                  value={carouselCards}
                  onChange={(e) => setCarouselCards(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  {[2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} cards</option>
                  ))}
                </select>
              </div>

              {/* Carousel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={carouselType}
                  onChange={(e) => setCarouselType(e.target.value as 'Image' | 'Video')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                </select>
              </div>

              {/* Button 1 Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">•</span> Button 1 Type
                </label>
                <select 
                  value={carouselCardButtons[0]?.type || 'Quick Reply'}
                  onChange={(e) => handleCarouselButtonChange(0, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="Quick Reply">Quick reply</option>
                  <option value="CTA">CTA</option>
                </select>
              </div>

              {/* Button 2 Type (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Type (Optional)</label>
                <select 
                  value={carouselCardButtons[1]?.type || ''}
                  onChange={(e) => handleCarouselButtonChange(1, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select option</option>
                  <option value="Quick Reply">Quick reply</option>
                  <option value="CTA">CTA</option>
                </select>
              </div>
              {/* Button 1 Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">•</span> Button 1 Type
                </label>
                <select 
                  value={carouselCardButtons[0]?.type || 'Quick Reply'}
                  onChange={(e) => handleCarouselButtonChange(0, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="Quick Reply">Quick reply</option>
                  <option value="CTA">CTA</option>
                </select>
              </div>

              {/* Button 2 Type (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Type (Optional)</label>
                <select 
                  value={carouselCardButtons[1]?.type || ''}
                  onChange={(e) => handleCarouselButtonChange(1, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select option</option>
                  <option value="Quick Reply">Quick reply</option>
                  <option value="CTA">CTA</option>
                </select>
              </div>
            </div>

            {/* Card Number Tabs */}
            <div className="flex gap-2 mb-6">
              {Array.from({length: parseInt(carouselCards)}, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveCardTab(i)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeCardTab === i 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Body Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500 text-lg">•</span>
                <label className="text-sm font-bold text-gray-900">Body</label>
                <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">i</span>
                </div>
              </div>
              <textarea
                value={carouselBodyContent}
                onChange={(e) => setCarouselBodyContent(e.target.value.slice(0, 200))}
                placeholder="Enter carousel body content..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">{carouselBodyContent.length}/200 characters</div>
            </div>

            {/* Active Card Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Card {activeCardTab + 1}</h4>
              
              {/* Card Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Content</label>
                <textarea
                  value={carouselCardContents[activeCardTab] || ''}
                  onChange={(e) => handleCarouselCardChange(activeCardTab, e.target.value.slice(0, 160))}
                  placeholder={`Enter content for card ${activeCardTab + 1}...`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(carouselCardContents[activeCardTab] || '').length}/160 characters
                </div>
              </div>

              {/* Card Button Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Type</label>
                  <select
                    value={carouselCardButtons[activeCardTab]?.type || 'Quick Reply'}
                    onChange={(e) => handleCarouselButtonChange(activeCardTab, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="Quick Reply">Quick Reply</option>
                    <option value="CTA">CTA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Button Text
                  </label>
                  <input
                    type="text"
                    value={carouselCardButtons[activeCardTab]?.text || ''}
                    onChange={(e) => handleCarouselButtonChange(activeCardTab, 'text', e.target.value)}
                    placeholder="Know More"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Upload - Show when Video Template OR Video Carousel is selected */}
        {(formData.templateType === 'Video' || (formData.templateType === 'Carousel' && carouselType === 'Video')) && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Video <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload video or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 16MB</p>
              </label>
              {videoFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">Video uploaded: {videoFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Upload - Show when Image Template is selected */}
        {formData.templateType === 'Image' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload image or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </label>
              {imageFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">Image uploaded: {imageFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Upload - Show when Document Template is selected */}
        {formData.templateType === 'Document' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'document')}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload document or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT up to 10MB</p>
              </label>
              {documentFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">Document uploaded: {documentFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocumentFile(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">Select the template category (as per Meta)</p>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
            required
          >
            <option value="">Choose category...</option>
            <option value="Marketing">Marketing</option>
            <option value="Utility">Utility</option>
            <option value="Authentication">Authentication</option>
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

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Custom Instructions (Brand Guidelines)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Add specific brand guidelines, tone requirements, or messaging instructions that should be prioritized
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Always mention our 30-day guarantee. Use friendly, conversational tone. Include sustainability messaging. Avoid technical jargon."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="text-xs text-gray-500 mt-1">
            These instructions will take priority over general tone and style guidelines
          </div>
        </div>

        {/* Regular Button Configuration - Hide when Carousel is selected */}
        {formData.templateType !== 'Carousel' && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={addButtons}
                onChange={(e) => setAddButtons(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              <span className="text-sm font-medium text-gray-900">Add Buttons to Template?</span>
            </label>

            {addButtons && (
              <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Type</label>
                  <select
                    value={buttonConfig.type}
                    onChange={(e) => setButtonConfig({...buttonConfig, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="CTA">CTA</option>
                    <option value="Quick Reply">Quick Reply</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonConfig.text}
                    onChange={(e) => setButtonConfig({...buttonConfig, text: e.target.value})}
                    placeholder="e.g., Shop Now, Call Us"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

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

      {/* WhatsApp Preview */}
      {generatedContent && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          
          <div className="bg-[#e5ddd5] p-4 rounded-lg">
            {/* Body Message - Always at top for carousel */}
            {formData.templateType === 'Carousel' && carouselBodyContent && (
              <div className="bg-white rounded-lg shadow-sm max-w-sm ml-auto mb-3 overflow-hidden">
                <div className="p-3">
                  <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                    {carouselBodyContent}
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-2">
                    9:56 AM
                  </div>
                </div>
              </div>
            )}

            {/* Carousel Cards or Single Message */}
            {formData.templateType === 'Carousel' ? (
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-2">Carousel Preview ({carouselCards} cards)</div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {Array.from({length: parseInt(carouselCards)}, (_, index) => (
                    <div key={index} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Media Section - Fixed Height */}
                      <div className="h-32 bg-gray-900 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                        {carouselType === 'Video' && videoFile ? (
                          <video 
                            src={URL.createObjectURL(videoFile)} 
                            className="w-full h-32 object-cover"
                            muted
                            playsInline
                          />
                        ) : carouselType === 'Video' ? (
                          <div className="flex flex-col items-center text-white">
                            <div className="text-2xl mb-1">▶️</div>
                            <div className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Video {index + 1}</div>
                          </div>
                        ) : imageFile ? (
                          <img 
                            src={URL.createObjectURL(imageFile)} 
                            alt={`Card ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-white">
                            <div className="text-2xl mb-1">🖼️</div>
                            <div className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Image {index + 1}</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Card Content - Fixed Container */}
                      <div className="p-3 h-24 flex flex-col justify-between overflow-hidden">
                        <div className="text-xs text-gray-900 leading-tight overflow-hidden flex-1">
                          {carouselCardContents[index] || `Card ${index + 1} content will appear here...`}
                        </div>
                        
                        {/* Card Button */}
                        {carouselCardButtons[index]?.text && (
                          <button className="w-full bg-blue-50 border border-blue-200 text-blue-600 py-1 px-2 rounded text-xs font-medium mt-2 flex-shrink-0">
                            {carouselCardButtons[index].text}
                          </button>
                        )}
                      </div>
                    </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm max-w-sm ml-auto overflow-hidden">
                {/* Media Section for other template types */}
                {formData.templateType === 'Video' && videoFile && (
                  <div className="rounded-t-lg overflow-hidden">
                    <video 
                      src={URL.createObjectURL(videoFile)} 
                      className="w-full h-40 object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Video
                    </div>
                  </div>
                )}
                
                {formData.templateType === 'Image' && imageFile && (
                  <div className="rounded-t-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Template image"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                
                {formData.templateType === 'Document' && documentFile && (
                  <div className="bg-gray-100 rounded-t-lg p-4 border-b flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{documentFile.name}</div>
                      <div className="text-xs text-gray-500">{(documentFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                )}
                
                {formData.templateType === 'Limited Time Offer' && (
                  <div className="bg-red-100 rounded-t-lg p-2 border-b border-red-200">
                    <div className="text-red-600 text-xs font-medium text-center">⏰ LIMITED TIME OFFER</div>
                  </div>
                )}
                
                {/* Message Content */}
                <div className="p-4">
                  <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                    {generatedContent}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right mt-2">
                    9:56 AM
                  </div>
                </div>

                {/* Regular Buttons (Outside message bubble) */}
                {addButtons && buttonConfig.text && formData.templateType !== 'Carousel' && (
                  <div className="p-3 pt-0">
                    <button className="w-full bg-blue-50 border border-blue-200 text-blue-600 py-2 px-4 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
                      {buttonConfig.text}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateForm;
export { WhatsAppTemplateForm };