import OpenAI from 'openai';

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
    const body = await request.json();
    console.log('Template generation request:', body);
    
    // Validate required fields
    if (!body.category || !body.goal || !body.tone || !body.language) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: category, goal, tone, and language are required',
        success: false
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Build Meta-compliant prompt
    const prompt = buildMetaCompliantPrompt(body);
    
    console.log('Generated prompt:', prompt);
    
    // Generate response with strict parameters for compliance
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a WhatsApp Business API template expert who creates ONLY Meta-compliant templates. You understand:

- Character limits (1024 max for body)
- Template type requirements (Text, Image, Video, Document, Carousel, Limited Time Offer)
- Meta policy compliance for each category (Marketing, Utility, Authentication)
- Proper variable usage and formatting
- Button limitations and types
- Header/Footer restrictions

You NEVER exceed character limits and ALWAYS follow Meta's exact specifications.` 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: 300, // Strict limit to prevent long responses
      temperature: 0.7, // Controlled creativity
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    
    const content = response.choices[0].message.content.trim();
    console.log('Generated content:', content);
    
    // Validate character count
    if (content.length > 1024) {
      console.warn(`Content exceeds 1024 characters: ${content.length}`);
      // Truncate if needed
      const truncatedContent = content.substring(0, 1000) + '...';
      return new Response(JSON.stringify({
        content: truncatedContent,
        success: true,
        warning: 'Content was truncated to meet Meta limits'
      }), {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify({
      content: content,
      success: true,
      characterCount: content.length
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Template generation error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      content: 'Error generating template. Please try again.',
      success: false
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
};

function buildMetaCompliantPrompt(data) {
  const {
    category,
    templateCategory,
    templateType,
    goal,
    language,
    tone,
    variables = [],
    header,
    footer,
    addButtons,
    buttonConfig,
    carouselCards
  } = data;

  // Get template type specifications
  const templateSpecs = getTemplateTypeSpecs(templateType, carouselCards);
  
  // Get Meta category rules
  const categoryRules = getMetaCategoryRules(category);
  
  // Build variable section with strict validation
  const maxVariables = variables.length;
  const approvedVariables = variables.map((_, i) => `{{${i+1}}}`);
  
  let variableSection = '';
  if (maxVariables === 0) {
    variableSection = `
VARIABLES: NONE SELECTED
- Generate plain text without any {{}} placeholders
- Create engaging content without variable substitution`;
  } else {
    const variableList = variables.map((v, i) => `{{${i+1}}} = ${v}`).join(', ');
    variableSection = `
VARIABLES (MAXIMUM ${maxVariables}):
${variableList}
- Use ONLY these variables: ${approvedVariables.join(', ')}
- Each variable must be used meaningfully
- NO unauthorized variables allowed`;
  }

  // Get use case specific guidance
  const useCaseGuidance = getUseCaseGuidance(goal, category);
  
  // Build custom instructions
  let customInstructions = '';
  if (data.custom_prompt && data.custom_prompt.trim()) {
    customInstructions = `
CUSTOM INSTRUCTIONS:
"${data.custom_prompt}"
- Incorporate these instructions throughout the content
- These are brand-specific requirements that must be followed`;
  }

  // Build button instructions
  let buttonInstructions = '';
  if (addButtons && buttonConfig && buttonConfig.text) {
    buttonInstructions = `
BUTTON CONFIGURATION:
- Type: ${buttonConfig.type}
- Text: "${buttonConfig.text}"
- Subtype: ${buttonConfig.subtype || 'N/A'}
${buttonConfig.url ? `- URL: ${buttonConfig.url}` : ''}
${buttonConfig.phone ? `- Phone: ${buttonConfig.phone}` : ''}

IMPORTANT: Do NOT include button text in message body. Buttons are separate elements.`;
  }

  return `Create a Meta-compliant WhatsApp Business template with these EXACT specifications:

META COMPLIANCE REQUIREMENTS:
${categoryRules}

TEMPLATE TYPE: ${templateType}
${templateSpecs}

TEMPLATE DETAILS:
- Category: ${category}
- Use Case: ${goal}
- Language: ${language}
- Tone: ${tone}
${header ? `- Header: "${header}"` : ''}
${footer ? `- Footer: "${footer}"` : ''}

${variableSection}

${customInstructions}

${useCaseGuidance}

${buttonInstructions}

CRITICAL REQUIREMENTS:
1. MAXIMUM 1024 characters for message body
2. Use ONLY approved variables: ${approvedVariables.join(', ')}
3. Follow ${templateType} template format exactly
4. Comply with ${category} category restrictions
5. Match ${tone} tone consistently
6. Include strategic emojis (2-4 maximum)
7. Use proper line breaks (\\n for single, \\n\\n for paragraph)

CONTENT STRUCTURE:
1. Brief engaging greeting ${maxVariables > 0 ? `using {{1}}` : ''}
2. Clear value proposition for ${goal}
3. Concise supporting details
4. Clear call-to-action
5. Professional closing

Generate ONLY the message body content. Keep it under 1024 characters and Meta-compliant.`;
}

function getTemplateTypeSpecs(templateType, carouselCards) {
  const specs = {
    'Text': `
TEXT TEMPLATE SPECIFICATIONS:
- Plain text message only
- No media attachments
- Focus on compelling copy
- Maximum 1024 characters
- Can include variables and buttons`,

    'Image': `
IMAGE TEMPLATE SPECIFICATIONS:
- Single image attachment
- Text caption under 1024 characters
- Image should complement the message
- Focus on visual storytelling
- Can include variables and buttons`,

    'Video': `
VIDEO TEMPLATE SPECIFICATIONS:
- Single video attachment (max 16MB)
- Text caption under 1024 characters
- Video should be engaging and relevant
- Keep message concise as video is main content
- Can include variables and buttons`,

    'Document': `
DOCUMENT TEMPLATE SPECIFICATIONS:
- Single document attachment (PDF, DOC, etc.)
- Text message under 1024 characters
- Document should provide value (catalog, brochure, etc.)
- Message should explain document purpose
- Can include variables and buttons`,

    'Carousel': `
CAROUSEL TEMPLATE SPECIFICATIONS:
- Multiple cards (${carouselCards || 2}-10 cards maximum)
- Each card has: image, title, subtitle, button
- Main message under 1024 characters
- Cards showcase different products/options
- Each card can have its own CTA button
- Focus on variety and choice`,

    'Limited Time Offer': `
LIMITED TIME OFFER SPECIFICATIONS:
- Urgency-focused messaging
- Clear offer details and expiration
- Compelling value proposition
- Strong call-to-action
- Can include countdown or deadline
- Maximum 1024 characters`
  };

  return specs[templateType] || specs['Text'];
}

function getMetaCategoryRules(category) {
  const rules = {
    'Marketing': `
MARKETING CATEGORY RULES:
- Promotional content allowed
- Can include offers, discounts, sales
- Must provide opt-out mechanism
- Cannot be sent without user consent
- Can use persuasive language
- Emojis allowed for engagement`,

    'Utility': `
UTILITY CATEGORY RULES:
- Transactional/informational content only
- NO promotional language
- Must provide genuine utility/service
- Order updates, confirmations, reminders
- Cannot include marketing messages
- Professional tone required`,

    'Authentication': `
AUTHENTICATION CATEGORY RULES:
- OTP, verification codes only
- Extremely strict content rules
- NO promotional content whatsoever
- Must be purely functional
- Short, direct messages only
- No emojis or marketing language`
  };

  return rules[category] || rules['Utility'];
}

function getUseCaseGuidance(goal, category) {
  const guidance = {
    'Abandoned Cart': `
USE CASE: ABANDONED CART RECOVERY
- Gentle reminder about items left behind
- Create mild urgency without pressure
- Highlight product benefits briefly
- Make completion easy and appealing
- Include clear next step`,

    'Order Confirmation': `
USE CASE: ORDER CONFIRMATION
- Confirm purchase details clearly
- Express gratitude for the order
- Provide order number and timeline
- Build confidence in the purchase
- Set expectations for next steps`,

    'Delivery Reminder': `
USE CASE: DELIVERY REMINDER
- Inform about upcoming delivery
- Provide timing and preparation details
- Include tracking information if available
- Professional and helpful tone
- Clear contact information`,

    'COD Confirmation': `
USE CASE: COD CONFIRMATION
- Confirm cash-on-delivery order
- State exact amount to be paid
- Provide order details clearly
- Include confirmation/cancellation options
- Professional and clear communication`,

    'Sale Offer': `
USE CASE: SALE OFFER
- Highlight the offer clearly
- Create appropriate urgency
- Show value proposition
- Include clear terms and conditions
- Strong call-to-action`,

    'Custom': `
USE CASE: CUSTOM TEMPLATE
- Focus on the specific communication goal
- Provide relevant information clearly
- Match the intended purpose
- Professional and engaging tone
- Clear next steps or actions`
  };

  return guidance[goal] || guidance['Custom'];
}