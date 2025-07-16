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

  // New state for carousel and media
  const [carouselType, setCarouselType] = useState<'Image' | 'Video'>('Image');
  const [carouselCards, setCarouselCards] = useState('2');
  const [carouselBodyContent, setCarouselBodyContent] = useState('');
  const [carouselCardContents, setCarouselCardContents] = useState<string[]>(['', '']);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

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

  // Update carousel card contents when card count changes
  useEffect(() => {
    const cardCount = parseInt(carouselCards);
    setCarouselCardContents(prev => {
      const newContents = [...prev];
      while (newContents.length < cardCount) {
        newContents.push('');
      }
      return newContents.slice(0, cardCount);
    });
  }, [carouselCards]);

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
        carouselCardContents: formData.templateType === 'Carousel' ? carouselCardContents : undefined
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
    setVideoFile(null);
    setImageFile(null);
    setDocumentFile(null);
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

        {/* Carousel Type - Only show when Carousel is selected */}
        {formData.templateType === 'Carousel' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Carousel Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="carouselType"
                  value="Image"
                  checked={carouselType === 'Image'}
                  onChange={(e) => setCarouselType(e.target.value as 'Image' | 'Video')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Image Carousel</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="carouselType"
                  value="Video"
                  checked={carouselType === 'Video'}
                  onChange={(e) => setCarouselType(e.target.value as 'Image' | 'Video')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Video Carousel</span>
              </label>
            </div>
          </div>
        )}

        {/* Carousel Cards Count */}
        {formData.templateType === 'Carousel' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Number of Cards in Carousel <span className="text-red-500">*</span>
            </label>
            <select
              value={carouselCards}
              onChange={(e) => setCarouselCards(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {[2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num} Cards</option>
              ))}
            </select>
          </div>
        )}

        {/* Video Upload - Show when Video Template or Video Carousel is selected */}
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

        {/* Carousel Body Content */}
        {formData.templateType === 'Carousel' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Carousel Body Content <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-2">Main message that introduces the carousel (max 200 characters)</p>
            <textarea
              value={carouselBodyContent}
              onChange={(e) => setCarouselBodyContent(e.target.value.slice(0, 200))}
              placeholder="e.g., Browse our amazing collection below:"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">{carouselBodyContent.length}/200 characters</div>
          </div>
        )}

        {/* Carousel Card Contents */}
        {formData.templateType === 'Carousel' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Carousel Card Contents <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">Content for each carousel card (max 160 characters each)</p>
            <div className="space-y-3">
              {carouselCardContents.map((content, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card {index + 1} Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => handleCarouselCardChange(index, e.target.value.slice(0, 160))}
                    placeholder={`Content for card ${index + 1}...`}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">{content.length}/160 characters</div>
                </div>
              ))}
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

      {/* Generated Content Display with WhatsApp Preview */}
      {generatedContent && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Template Preview</h3>
          
          {/* WhatsApp-style Preview */}
          <div className="bg-[#e5ddd5] p-4 rounded-lg mb-4">
            <div className="bg-white rounded-lg shadow-sm max-w-sm ml-auto relative">
              
              {/* Media Section based on Template Type */}
              {formData.templateType === 'Image' && imageFile && (
                <div className="rounded-t-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Template image"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              {formData.templateType === 'Video' && videoFile && (
                <div className="rounded-t-lg overflow-hidden">
                  <video 
                    src={URL.createObjectURL(videoFile)} 
                    className="w-full h-48 object-cover"
                    controls
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
              
              {formData.templateType === 'Carousel' && (
                <div className="bg-gray-100 rounded-t-lg border-b">
                  {/* Horizontal Scrolling Cards */}
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-2 p-3" style={{ width: `${parseInt(carouselCards) * 200}px` }}>
                      {carouselCardContents.map((cardContent, index) => (
                        <div key={index} className="flex-shrink-0 w-48 bg-white rounded border shadow-sm">
                          {/* Card Media */}
                          <div className="h-24 bg-gray-200 rounded-t flex items-center justify-center">
                            {carouselType === 'Video' ? (
                              videoFile ? (
                                <video 
                                  src={URL.createObjectURL(videoFile)} 
                                  className="w-full h-full object-cover rounded-t"
                                />
                              ) : (
                                <div className="text-gray-600 text-2xl">🎥</div>
                              )
                            ) : (
                              <div className="text-gray-600 text-2xl">🖼️</div>
                            )}
                          </div>
                          
                          {/* Card Content */}
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-900 mb-1">Card {index + 1}</div>
                            <div className="text-xs text-gray-700 leading-tight">
                              {cardContent || `Content for card ${index + 1}...`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                {formData.templateType === 'Carousel' && carouselBodyContent ? (
                  <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line mb-2">
                    {carouselBodyContent}
                  </div>
                ) : null}
                
                <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                  {generatedContent}
                </div>
                
                {/* Character Count */}
                <div className="text-xs text-gray-400 mt-2">
                  {generatedContent.length}/1024 characters
                </div>
                
                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-right mt-2">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Raw Content */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Raw Template Content:</h4>
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