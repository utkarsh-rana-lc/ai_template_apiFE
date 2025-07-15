import React, { useState } from 'react';
import TemplateTypeSelector from './TemplateTypeSelector';
import WhatsAppTemplateGenerator from './WhatsAppTemplateGenerator';
import ProductAwareTemplateGenerator from './ProductAwareTemplateGenerator';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'selector' | 'scratch' | 'product-aware'>('selector');
  const [insertedTemplates, setInsertedTemplates] = useState<Array<{content: string, product?: string}>>([]);

  const handleTemplateGenerated = (content: string) => {
    setInsertedTemplates(prev => [...prev, { content }]);
    console.log('Template generated:', content);
  };

  const handleProductTemplateInsert = (content: string, productName: string) => {
    setInsertedTemplates(prev => [...prev, { content, product: productName }]);
    console.log(`Product template inserted for ${productName}:`, content);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
  };

  if (currentView === 'selector') {
    return (
      <TemplateTypeSelector 
        onSelectType={(type) => setCurrentView(type)}
      />
    );
  }

  if (currentView === 'scratch') {
    return (
      <WhatsAppTemplateGenerator onBack={handleBackToSelector} />
    );
  }

  if (currentView === 'product-aware') {
    return (
      <ProductAwareTemplateGenerator onBack={handleBackToSelector} />
    );
  }

  return null;
};

export default MainApp;