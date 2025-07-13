// Type definitions for WhatsApp Template Generator

export interface FormData {
  category: string;
  goal: string;
  language: string;
  tone: string;
  variables: string[];
}

export interface TemplateFormProps {
  onTemplateGenerated?: (content: string) => void;
  apiEndpoint?: string;
  className?: string;
}

export interface TemplateRequest {
  category: string;
  goal: string;
  tone: string;
  language: string;
  variables: string[];
}

export interface TemplateResponse {
  content: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Template categories as per Meta's guidelines
export type TemplateCategory = 'Marketing' | 'Utility' | 'Authentication';

// Supported languages
export type Language = 'English' | 'Hindi' | 'Hinglish';

// Available tones
export type Tone = 'Conversational' | 'Informative' | 'Persuasive' | 'Promotional' | 'Reassuring';

// Common use cases
export type UseCase = 'Abandoned Cart' | 'Order Confirmation' | 'Delivery Reminder' | 'COD Confirmation' | 'Sale Offer' | 'Custom';

// Available variables for templates
export type TemplateVariable = 'Customer Name' | 'Product Name' | 'Order ID' | 'Delivery Date' | 'Discount Code';