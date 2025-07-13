import OpenAI from 'openai';

function buildPrompt(category, goal, tone, language, variables) {
  const variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
  const placeholderList = variables.map((_, i) => `{{${i+1}}}`).join(', ');

  // Enhanced context-specific prompts based on use case
  const contextualGuidance = getContextualGuidance(goal, category);
  const toneGuidance = getToneGuidance(tone);
  const languageGuidance = getLanguageGuidance(language);

  return `You are an expert WhatsApp Business API template writer with deep knowledge of Meta's messaging policies and e-commerce best practices.

CONTEXT:
- Template Category: ${category}
- Use Case: ${goal}
- Communication Tone: ${tone}
- Language: ${language}
- Target: ${contextualGuidance.audience}

${contextualGuidance.context}

VARIABLES TO INCLUDE:
${variableDefinitions}

TONE & STYLE REQUIREMENTS:
${toneGuidance}

LANGUAGE REQUIREMENTS:
${languageGuidance}

COMPLIANCE RULES:
- Must comply with Meta's WhatsApp Business Policy
- No promotional language if category is "Utility" or "Authentication"
- Use variables in order: ${placeholderList}
- Maximum 1024 characters
- No emojis in Authentication templates
- No URLs or call-to-action buttons in message body
- Avoid words like "Click here", "Buy now", "Limited time" for non-Marketing templates

STRUCTURE REQUIREMENTS:
- Start with personalized greeting using {{1}} (customer name)
- Include relevant business context
- Provide clear, actionable information
- End with appropriate closing based on use case

Generate ONLY the message body text. No explanations, no formatting, no additional content.`;
}

function getContextualGuidance(goal, category) {
  const contexts = {
    'Abandoned Cart': {
      audience: 'Customers who left items in their shopping cart',
      context: `PURPOSE: Gently remind customers about their abandoned cart and encourage completion.
APPROACH: Be helpful, not pushy. Focus on convenience and value.
KEY ELEMENTS: Reference specific product, mention easy completion process, create mild urgency without being aggressive.
AVOID: Aggressive sales language, multiple exclamation marks, pressure tactics.`
    },
    'Order Confirmation': {
      audience: 'Customers who just completed a purchase',
      context: `PURPOSE: Confirm order details and provide reassurance about the purchase.
APPROACH: Professional, reassuring, and informative.
KEY ELEMENTS: Order confirmation, delivery timeline, thank you message, next steps.
AVOID: Promotional content, upselling, unnecessary information.`
    },
    'Delivery Reminder': {
      audience: 'Customers expecting a delivery',
      context: `PURPOSE: Inform customers about upcoming delivery and ensure they're available.
APPROACH: Clear, informative, and helpful.
KEY ELEMENTS: Delivery timing, preparation instructions, contact information if needed.
AVOID: Marketing content, promotional offers, lengthy explanations.`
    },
    'COD Confirmation': {
      audience: 'Customers who chose Cash on Delivery payment',
      context: `PURPOSE: Confirm COD order details and get explicit confirmation.
APPROACH: Clear, direct, and professional.
KEY ELEMENTS: Order summary, amount to be paid, confirmation request, cancellation option.
AVOID: Promotional language, complex instructions, ambiguous terms.`
    },
    'Sale Offer': {
      audience: 'Existing customers or prospects interested in promotions',
      context: `PURPOSE: Inform about special offers or discounts.
APPROACH: Exciting but not overwhelming, value-focused.
KEY ELEMENTS: Clear offer details, value proposition, validity period, easy action steps.
AVOID: Excessive exclamation marks, "too good to be true" language, complex terms.`
    },
    'Custom': {
      audience: 'General customers',
      context: `PURPOSE: Provide relevant information or updates to customers.
APPROACH: Professional, clear, and customer-centric.
KEY ELEMENTS: Clear purpose, relevant information, appropriate next steps.
AVOID: Generic language, unclear messaging, irrelevant details.`
    }
  };

  return contexts[goal] || contexts['Custom'];
}

function getToneGuidance(tone) {
  const toneGuides = {
    'Conversational': `- Use natural, friendly language like talking to a friend
- Include conversational connectors ("So", "Well", "By the way")
- Keep sentences varied in length
- Use contractions (we'll, you're, it's)
- Sound warm and approachable`,
    
    'Informative': `- Be clear, direct, and factual
- Use simple, easy-to-understand language
- Structure information logically
- Avoid emotional language
- Focus on providing value through information`,
    
    'Persuasive': `- Use compelling but not aggressive language
- Focus on benefits and value
- Include social proof elements when appropriate
- Create gentle urgency
- Appeal to customer needs and desires`,
    
    'Promotional': `- Highlight offers and benefits clearly
- Use exciting but professional language
- Create appropriate urgency
- Focus on value proposition
- Make the offer irresistible but believable`,
    
    'Reassuring': `- Use calming, supportive language
- Provide clear next steps
- Address potential concerns proactively
- Sound reliable and trustworthy
- Offer assistance and support`
  };

  return toneGuides[tone] || toneGuides['Informative'];
}

function getLanguageGuidance(language) {
  const languageGuides = {
    'English': `- Use clear, professional English
- Avoid complex vocabulary
- Use active voice
- Keep sentences concise
- Ensure grammar is perfect`,
    
    'Hindi': `- Use simple, clear Hindi
- Avoid complex Sanskrit words
- Use familiar, everyday vocabulary
- Maintain respectful tone with appropriate honorifics
- Ensure proper Devanagari script if needed`,
    
    'Hinglish': `- Mix Hindi and English naturally
- Use English for technical terms (order, delivery, etc.)
- Use Hindi for emotional connection and greetings
- Keep the mix balanced and natural
- Avoid forced code-switching`
  };

  return languageGuides[language] || languageGuides['English'];
}

export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  try {
    // Parse request body
    const body = await request.json();
    
    console.log('Request received:', body);
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Build enhanced prompt
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables || []
    );
    
    console.log('Generated prompt length:', prompt.length);
    
    // Generate response with better parameters
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using more capable model
      messages: [{ 
        role: "system", 
        content: "You are an expert WhatsApp Business template writer. Generate only the message body content, nothing else." 
      }, {
        role: "user", 
        content: prompt 
      }],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    
    const content = response.choices[0].message.content.trim();
    console.log('OpenAI response:', content);
    
    return new Response(JSON.stringify({
      content: content
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      content: 'Error generating template. Please try again.'
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
};