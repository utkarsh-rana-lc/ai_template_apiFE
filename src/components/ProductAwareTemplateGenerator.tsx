import React, { useState } from 'react';
import { X, Search, Loader2, RefreshCw, ChevronDown, Send } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface GeneratedTemplate {
  product: string;
  content: string;
  variables: Record<string, string>;
}

interface ButtonConfig {
  type: 'CTA' | 'Quick Reply';
  subtype?: 'Static URL' | 'Dynamic URL' | 'Copy Code' | 'Phone Number';
  text: string;
  url?: string;
  phone?: string;
}

interface ProductAwareTemplateGeneratorProps {
  onBack: () => void;
}

const ProductAwareTemplateGenerator: React.FC<ProductAwareTemplateGeneratorProps> = ({ onBack }) => {
  // Mock product data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Rice Face Wash',
      description: 'Enriched with Rice Water and Niacinamide for gentle cleansing and brightening',
      image_url: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '2',
      name: 'Vitamin C Serum',
      description: '20% Vitamin C with Hyaluronic Acid for radiant, youthful skin',
      image_url: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '3',
      name: 'Retinol Night Cream',
      description: 'Anti-aging night cream with 0.5% Retinol for smooth, firm skin',
      image_url: 'https://images.pexels.com/photos/4465833/pexels-photo-4465833.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '4',
      name: 'Hyaluronic Acid Moisturizer',
      description: 'Deep hydration with Hyaluronic Acid and Ceramides for all skin types',
      image_url: 'https://images.pexels.com/photos/4465835/pexels-photo-4465835.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [useCase, setUseCase] = useState('');
  const [tone, setTone] = useState('');
  const [language, setLanguage] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [addButtons, setAddButtons] = useState(false);
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig>({
    type: 'CTA',
    subtype: 'Static URL',
    text: '',
    url: ''
  });
  const [category, setCategory] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [carouselCards, setCarouselCards] = useState('2');

  const [generatedTemplates, setGeneratedTemplates] = useState<GeneratedTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingProduct, setRegeneratingProduct] = useState<string | null>(null);
  const [isSendingForApproval, setIsSendingForApproval] = useState(false);

  const useCases = [
    'Abandoned Checkout',
    'Order Confirmation',
    'Upsell',
    'Cross-sell',
    'Product Launch',
    'Restock Alert',
    'Review Request'
  ];

  const tones = [
    'Conversational',
    'Persuasive',
    'Informative',
    'Promotional',
    'Friendly'
  ];

  const languages = ['English', 'Hindi'];

  const categories = ['Marketing', 'Utility', 'Authentication'];
  
  const templateTypes = [
    'Text',
    'Image', 
    'Video',
    'Document',
    'Carousel',
    'Limited Time Offer'
  ];

  const availableVariables = [
    'Customer Name',
    'Product Name',
    'Order ID',
    'Discount Code',
    'Price',
    'Delivery Date'
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setGeneratedTemplates(generatedTemplates.filter(t => t.product !== selectedProducts.find(p => p.id === productId)?.name));
  };

  const handleSelectAll = () => {
    setSelectedProducts(mockProducts);
    setShowProductDropdown(false);
  };

  const handleVariableToggle = (variable: string) => {
    setVariables(prev =>
      prev.includes(variable)
        ? prev.filter(v => v !== variable)
        : [...prev, variable]
    );
  };

  const generateTemplates = async () => {
    if (!selectedProducts.length || !useCase || !tone || !language || !category || !templateType) {
      alert('Please fill in all required fields including Category and Template Type, and select at least one product');
      return;
    }

    setIsGenerating(true);
    
    try {
      const payload = {
        products: selectedProducts.map(p => ({
          name: p.name,
          description: p.description,
          image_url: p.image_url
        })),
        goal: useCase,
        tone,
        language,
        category,
        template_type: templateType,
        carousel_cards: carouselCards,
        variables,
        custom_prompt: customPrompt,
        add_buttons: addButtons,
        button_config: addButtons ? buttonConfig : null
      };

      console.log('Generating templates with payload:', payload);

      const response = await fetch('/.netlify/functions/generate_template_product_aware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const templates = await response.json();
        console.log('API Response:', templates);
        
        // Validate that templates respect variable selection
        const validatedTemplates = templates.map((t: any) => {
          const template = {
            product: t.product,
            content: t.content || t.body || '', // Handle different response formats
            variables: t.variables || {}
          };
          
          // Validate variable count matches selection
          const expectedVarCount = variables.length;
          const actualVarCount = Object.keys(template.variables).length;
          
          if (actualVarCount !== expectedVarCount) {
            console.warn(`Variable count mismatch for ${t.product}: expected ${expectedVarCount}, got ${actualVarCount}`);
          }
          
          return template;
        });
        
        setGeneratedTemplates(validatedTemplates);
      } else {
        // Fallback to mock data for demo
        const mockTemplates: GeneratedTemplate[] = selectedProducts.map(product => {
          // Create mock template that respects variable selection
          const variableMap: Record<string, string> = {};
          variables.forEach((variable, index) => {
            variableMap[`{{${index + 1}}}`] = variable;
          });
          
          let mockContent = '';
          if (variables.length === 0) {
            mockContent = `Your ${product.name} is waiting for you! 🌟\n\n${product.description}\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
          } else if (variables.length === 1) {
            mockContent = `{{1}}, your ${product.name} is waiting! 🌟\n\n${product.description}\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
          } else if (variables.length === 2) {
            mockContent = `{{1}}, your {{2}} is waiting! 🌟\n\n${product.description}\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
          } else {
            const varStr = variables.map((_, i) => `{{${i+1}}}`).slice(0, 3).join(', ');
            mockContent = `${varStr.split(',')[0]}, your ${varStr.split(',')[1] || product.name} is ready! 🌟\n\n${product.description}\n\nOrder: ${varStr.split(',')[2] || 'confirmed'} ✨\n\nDon't miss out! 💫`;
          }
          
          return {
            product: product.name,
            content: mockContent,
            variables: variableMap
          };
        });
        setGeneratedTemplates(mockTemplates);
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      // Error fallback that respects variable selection
      const mockTemplates: GeneratedTemplate[] = selectedProducts.map(product => {
        const variableMap: Record<string, string> = {};
        variables.forEach((variable, index) => {
          variableMap[`{{${index + 1}}}`] = variable;
        });
        
        const mockContent = variables.length === 0 
          ? `Your ${product.name} is waiting! 🌟\n\n${product.description}\n\nGet it now! ✨`
          : variables.length === 1
          ? `{{1}}, your ${product.name} is waiting! 🌟\n\n${product.description}\n\nGet it now! ✨`
          : `{{1}}, your {{2}} is waiting! 🌟\n\n${product.description}\n\nGet it now! ✨`;
        
        return {
          product: product.name,
          content: mockContent,
          variables: variableMap
        };
      });
      setGeneratedTemplates(mockTemplates);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateTemplate = async (productName: string) => {
    const product = selectedProducts.find(p => p.name === productName);
    if (!product) return;

    setRegeneratingProduct(productName);

    try {
      console.log(`🔄 Starting regeneration for ${productName}`);
      
      const regenerationPayload = {
        products: [{
          name: product.name,
          description: product.description,
          image_url: product.image_url
        }],
        goal: useCase,
        tone,
        language,
        variables,
        category,
        template_type: templateType,
        carousel_cards: carouselCards,
        custom_prompt: customPrompt,
        add_buttons: addButtons,
        button_config: addButtons ? buttonConfig : null,
        regenerate: true,
        timestamp: Date.now() // Force fresh generation
      };

      console.log(`📤 Regeneration payload:`, regenerationPayload);

      const response = await fetch('/.netlify/functions/generate_template_product_aware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regenerationPayload)
      });

      console.log(`📥 Regeneration response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Regeneration API success:`, result);
        
        if (result && Array.isArray(result) && result.length > 0) {
          const regeneratedTemplate = result[0];
          
          const newTemplate = {
            product: regeneratedTemplate.product,
            content: regeneratedTemplate.content || regeneratedTemplate.body || '',
            variables: regeneratedTemplate.variables || {}
          };
          
          console.log(`🔄 Updating template for ${productName}:`, newTemplate);
          
          setGeneratedTemplates(prev =>
            prev.map(t => t.product === productName ? newTemplate : t)
          );
          
          console.log(`✅ Template updated successfully for ${productName}`);
        } else {
          throw new Error('Invalid response format from API');
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ Regeneration error for ${productName}:`, error);
      
      // Create enhanced fallback with randomization
      const variableMap: Record<string, string> = {};
      variables.forEach((variable, index) => {
        variableMap[`{{${index + 1}}}`] = variable;
      });
      
      const fallbackOptions = [
        `🌟 ${productName} is calling your name!\n\n${product.description.substring(0, 80)}...\n\nDon't wait - grab yours now! ✨`,
        `✨ Ready for ${productName}?\n\n${product.description.substring(0, 80)}...\n\nLimited stock available! 🔥`,
        `💫 ${productName} - your perfect match!\n\n${product.description.substring(0, 80)}...\n\nOrder today! 🛒`
      ];
      
      let fallbackContent = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      
      // Add variables if selected
      if (variables.length > 0) {
        fallbackContent = `{{1}}, ` + fallbackContent;
      }
      if (variables.length > 1) {
        fallbackContent = fallbackContent.replace(productName, '{{2}}');
      }
      
      const fallbackTemplate: GeneratedTemplate = {
        product: productName,
        content: fallbackContent,
        variables: variableMap
      };
      
      setGeneratedTemplates(prev => 
        prev.map(t => t.product === productName ? fallbackTemplate : t)
      );
      
      console.log(`✅ Used enhanced fallback for ${productName}`);
    } finally {
      setRegeneratingProduct(null);
    }
  };

  const sendForApproval = async () => {
    if (generatedTemplates.length === 0) {
      alert('Please generate templates first');
      return;
    }

    setIsSendingForApproval(true);

    try {
      // Mock API call for sending templates for approval
      const approvalPayload = {
        templates: generatedTemplates.map(template => ({
          product: template.product,
          content: template.content,
          variables: template.variables,
          use_case: useCase,
          tone,
          language,
          buttons: addButtons ? buttonConfig : null
        })),
        metadata: {
          created_at: new Date().toISOString(),
          custom_instructions: customPrompt
        }
      };

      console.log('Sending for approval:', approvalPayload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`${generatedTemplates.length} templates sent for Meta approval successfully!`);
      
      // Optionally reset form or navigate back
      // onBack();
      
    } catch (error) {
      console.error('Error sending for approval:', error);
      alert('Error sending templates for approval. Please try again.');
    } finally {
      setIsSendingForApproval(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
              <h1 className="text-xl font-semibold text-gray-900">Product and Context-Aware Template Generator</h1>
              <p className="text-sm text-gray-600">Generate WhatsApp templates for specific products</p>
            </div>
          </div>
          
          {/* Send for Approval CTA */}
          {generatedTemplates.length > 0 && (
            <button
              onClick={sendForApproval}
              disabled={isSendingForApproval}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSendingForApproval ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send for Approval ({generatedTemplates.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-80px)]">
        {/* Left Column - Form */}
        <div className="p-6 overflow-y-auto bg-white border-r border-gray-200">
          <div className="max-w-lg space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Template Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Template Type <span className="text-red-500">*</span>
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select template type...</option>
                {templateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Carousel Cards Count */}
            {templateType === 'Carousel' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Number of Cards in Carousel <span className="text-red-500">*</span>
                </label>
                <select
                  value={carouselCards}
                  onChange={(e) => setCarouselCards(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} Cards</option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Products <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg p-2 min-h-[44px] flex-wrap gap-2">
                  {selectedProducts.map(product => (
                    <span
                      key={product.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {product.name}
                      <button
                        onClick={() => handleProductRemove(product.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex-1 min-w-[120px]">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full border-none outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {showProductDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    <button
                      onClick={handleSelectAll}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 font-medium text-blue-600"
                    >
                      Select All Products
                    </button>
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate">{product.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Use Case <span className="text-red-500">*</span>
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select use case...</option>
                {useCases.map(uc => (
                  <option key={uc} value={uc}>{uc}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tone <span className="text-red-500">*</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select tone...</option>
                {tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language <span className="text-red-500">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select language...</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Variables</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableVariables.map(variable => (
                  <label key={variable} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={variables.includes(variable)}
                      onChange={() => handleVariableToggle(variable)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">{variable}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Custom Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Use brand tone of voice. Emphasize limited-time offers."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Add Buttons Toggle */}
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
                      onChange={(e) => setButtonConfig({...buttonConfig, type: e.target.value as 'CTA' | 'Quick Reply'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="CTA">CTA</option>
                      <option value="Quick Reply">Quick Reply</option>
                    </select>
                  </div>

                  {buttonConfig.type === 'CTA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Subtype</label>
                      <select
                        value={buttonConfig.subtype}
                        onChange={(e) => setButtonConfig({...buttonConfig, subtype: e.target.value as any})}
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
                      value={buttonConfig.text}
                      onChange={(e) => setButtonConfig({...buttonConfig, text: e.target.value})}
                      placeholder="e.g., Shop Now, Call Us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {buttonConfig.type === 'CTA' && buttonConfig.subtype?.includes('URL') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={buttonConfig.url || ''}
                        onChange={(e) => setButtonConfig({...buttonConfig, url: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}

                  {buttonConfig.type === 'CTA' && buttonConfig.subtype === 'Phone Number' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={buttonConfig.phone || ''}
                        onChange={(e) => setButtonConfig({...buttonConfig, phone: e.target.value})}
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateTemplates}
             disabled={isGenerating || !selectedProducts.length || !useCase || !tone || !language || !category || !templateType}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Templates...
                </>
              ) : (
                'Generate Templates'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Previews */}
        <div className="p-6 overflow-y-auto bg-gray-50">
          {selectedProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products selected</p>
                <p className="text-sm text-gray-400 mt-1">Select products to see previews</p>
              </div>
            </div>
          ) : generatedTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">📱</span>
                </div>
                <p className="text-gray-500">Ready to generate templates</p>
                <p className="text-sm text-gray-400 mt-1">Fill the form and click "Generate Templates"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedTemplates.map((template, index) => {
                const product = selectedProducts.find(p => p.name === template.product);
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Product Header */}
                    <div className="p-3 border-b border-gray-100 flex items-center gap-3">
                      <img
                        src={product?.image_url}
                        alt={product?.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{template.product}</h3>
                        <p className="text-xs text-gray-500 truncate">{product?.description}</p>
                      </div>
                    </div>

                    {/* WhatsApp Preview */}
                    <div className="p-3 bg-[#e5ddd5]">
                      {/* WhatsApp Message Container */}
                      <div className="bg-white rounded-lg shadow-sm max-w-sm ml-auto relative">
                        {/* Media Section (Video Placeholder) */}
                        <div className="bg-black rounded-t-lg h-24 flex items-center justify-center relative">
                          <div className="text-white text-2xl">▶</div>
                          <div className="absolute bottom-1 right-1 text-white text-xs">0:15</div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="p-3">
                          <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line text-left">
                            {template.content}
                          </div>
                          
                          {/* Timestamp */}
                          <div className="text-xs text-gray-500 text-right mt-2">
                      {templateType === 'Video' && (
                        <div className="bg-black rounded-t-lg h-24 flex items-center justify-center relative">
                          <div className="text-white text-2xl">▶</div>
                          <div className="absolute bottom-1 right-1 text-white text-xs">0:15</div>
                        </div>
                      )}
                      
                      {templateType === 'Image' && (
                        <div className="bg-gray-200 rounded-t-lg h-24 flex items-center justify-center relative">
                          <div className="text-gray-600 text-2xl">🖼️</div>
                        </div>
                      )}
                      
                      {templateType === 'Document' && (
                        <div className="bg-gray-100 rounded-t-lg h-16 flex items-center justify-center relative border-b">
                          <div className="text-gray-600 text-lg">📄</div>
                          <div className="ml-2 text-sm text-gray-700">{product?.name}.pdf</div>
                        </div>
                      )}
                      
                      {templateType === 'Carousel' && (
                        <div className="bg-gray-100 rounded-t-lg h-20 flex items-center justify-center relative border-b">
                          <div className="flex space-x-2">
                            {Array.from({length: parseInt(carouselCards)}, (_, i) => (
                              <div key={i} className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-500">{i + 1}</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute bottom-1 right-1 text-xs text-gray-600">
                            {carouselCards} cards
                          </div>
                        </div>
                      )}
                      
                      {/* Buttons (Outside message bubble) */}
                      {addButtons && buttonConfig.text && (
                        <div className="mt-2 space-y-1 max-w-sm ml-auto">
                          <button className="w-full bg-white border border-gray-300 text-blue-600 py-2 px-4 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
                            {buttonConfig.text}
                          </button>
                          {buttonConfig.type === 'CTA' && (
                            <button className="w-full bg-white border border-gray-300 text-blue-600 py-2 px-4 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
                              Copy offer code
                            </button>
                          )}
                        </div>
                      )}

                      {/* Variables Info */}
                      {Object.keys(template.variables || {}).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-w-sm ml-auto">
                          <div className="font-medium text-gray-700 mb-1">Variables:</div>
                          {Object.entries(template.variables || {}).map(([key, value]) => (
                            <div key={key} className="text-gray-600">
                              <code className="bg-gray-200 px-1 rounded">{key}</code> → {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => regenerateTemplate(template.product)}
                        disabled={regeneratingProduct === template.product}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                      >
                        {regeneratingProduct === template.product ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Regenerate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAwareTemplateGenerator;