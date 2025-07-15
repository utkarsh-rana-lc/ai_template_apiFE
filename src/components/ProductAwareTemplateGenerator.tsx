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
    if (!selectedProducts.length || !useCase || !tone || !language) {
      alert('Please fill in all required fields and select at least one product');
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
        setGeneratedTemplates(templates.map((t: any) => ({
          product: t.product,
          content: t.content,
          variables: t.variables
        })));
      } else {
        // Fallback to mock data for demo
        const mockTemplates: GeneratedTemplate[] = selectedProducts.map(product => ({
          product: product.name,
          content: `Hi {{1}}, your ${product.name} is waiting for you! 🌟\n\n${product.description}\n\nComplete your purchase now and get glowing skin! ✨\n\nUse code {{2}} for extra savings! 💰\n\nOrder by {{3}} for fast delivery! 🚚\n\nDon't miss out! 💫`,
          variables: {
            '{{1}}': 'Customer Name',
            '{{2}}': 'Discount Code',
            '{{3}}': 'Delivery Date'
          }
        }));
        setGeneratedTemplates(mockTemplates);
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      // Fallback mock data
      const mockTemplates: GeneratedTemplate[] = selectedProducts.map(product => ({
        product: product.name,
        content: `Hi {{1}}, your ${product.name} is waiting for you! 🌟\n\n${product.description}\n\nComplete your purchase now and get glowing skin! ✨\n\nUse code {{2}} for extra savings! 💰\n\nOrder by {{3}} for fast delivery! 🚚\n\nDon't miss out! 💫`,
        variables: {
          '{{1}}': 'Customer Name',
          '{{2}}': 'Discount Code',
          '{{3}}': 'Delivery Date'
        }
      }));
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
      // Mock regeneration - replace with actual API call
      setTimeout(() => {
        const newTemplate: GeneratedTemplate = {
          product: productName,
          content: `🌟 ${productName} is calling you!\n\nDon't let your skincare routine wait! ${product.description}\n\nYour skin deserves the best care. Complete your order now! ✨\n\nSpecial offer just for you! 🎁\n\nUse {{2}} for instant savings! 💰\n\nOrder by {{3}} today! 🚚`,
          variables: {
            '{{1}}': 'Customer Name',
            '{{2}}': 'Discount Code',
            '{{3}}': 'Delivery Date'
          }
        };

        setGeneratedTemplates(prev =>
          prev.map(t => t.product === productName ? newTemplate : t)
        );
        setRegeneratingProduct(null);
      }, 2000);
    } catch (error) {
      console.error('Error regenerating template:', error);
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
              disabled={isGenerating || !selectedProducts.length || !useCase || !tone || !language}
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
                            1:04 AM
                          </div>
                        </div>
                      </div>
                      
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
                      {Object.keys(template.variables).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-w-sm ml-auto">
                          <div className="font-medium text-gray-700 mb-1">Variables:</div>
                          {Object.entries(template.variables).map(([key, value]) => (
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