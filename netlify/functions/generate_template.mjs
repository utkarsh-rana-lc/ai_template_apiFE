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
        error: 'Missing required fields: category, goal, tone, language are required',
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
    
    console.log('Generated prompt for template type:', body.templateType || 'Text');
    
    // Generate response with strict parameters for compliance
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a WhatsApp Business API template expert who creates ONLY Meta-compliant templates. You understand:

- STRICT 1024 character limit for message body (NEVER exceed)
- Template type requirements (Text, Image, Video, Document, Carousel, Limited Time Offer)
- Meta policy compliance for each category (Marketing, Utility, Authentication)
- Proper variable usage and formatting
- Button limitations and types for each template
- Header/Footer restrictions
- Carousel template specifications (multiple cards, each with image/title/subtitle)

You NEVER exceed character limits and ALWAYS follow Meta's exact specifications for each template type.` 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: body.templateType === 'Carousel' ? 400 : 200, // More tokens for carousel
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.4, // Reduce repetition
      presence_penalty: 0.3
    });
    
    const content = response.choices[0].message.content.trim();
    console.log('Generated content length:', content.length);
    
    // Handle carousel response
    if (body.templateType === 'Carousel') {
      const cardCount = parseInt(body.carouselCards || '2');
      const maxVars = body.variables?.length || 0;
      
      // Generate individual card content ensuring ALL variables are used
      const cards = Array.from({ length: cardCount }, (_, i) => {
        let cardContent = '';
        
        if (maxVars === 0) {
          cardContent = `Option ${i + 1}: Perfect for ${body.goal.toLowerCase()}! ✨\n\nGet yours today! 🛒`;
        } else if (maxVars === 1) {
          cardContent = `{{1}}, option ${i + 1} is perfect for you! ✨\n\nGet yours today! 🛒`;
        } else if (maxVars === 2) {
          cardContent = `{{1}}, your {{2}} - option ${i + 1}! ✨\n\nPerfect choice for you! 🛒`;
        } else if (maxVars === 3) {
          cardContent = `{{1}}, {{2}} order {{3}} - option ${i + 1}! ✨\n\nGet it now! 🛒`;
        } else if (maxVars === 4) {
          cardContent = `{{1}}, {{2}} with {{3}} expires {{4}} - option ${i + 1}! ✨\n\nAct now! 🛒`;
        } else if (maxVars === 5) {
          cardContent = `{{1}}, get {{5}} off {{2}}! Order {{3}} delivers {{4}} - option ${i + 1}! ✨`;
        } else {
          // Use first 3 variables for cards with many variables
          cardContent = `{{1}}, {{2}} {{3}} - option ${i + 1}! ✨\n\nGet it now! 🛒`;
        }
        
        return cardContent;
      });
      
      return new Response(JSON.stringify({
        content: content,
        carouselCards: cards,
        success: true,
        characterCount: content.length,
        templateType: body.templateType,
        variablesUsed: maxVars
      }), {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    // STRICT character validation
    if (content.length > 1024) {
      console.warn(`Content exceeds 1024 characters: ${content.length} - TRUNCATING`);
      const truncatedContent = content.substring(0, 1000) + '...';
      return new Response(JSON.stringify({
        content: truncatedContent,
        success: true,
        warning: 'Content was truncated to meet Meta 1024 character limit',
        characterCount: truncatedContent.length
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
      characterCount: content.length,
      templateType: body.templateType || 'Text'
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
    templateType = 'Text',
    carouselCards,
    isLTO,
    ltoTitle,
    ltoExpirationDate,
    goal,
    language,
    tone,
    variables = [],
    header,
    footer,
    addButtons,
    buttonConfig,
    custom_prompt
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
- Each variable MUST be used at least once in the content
- Use ALL selected variables: ${approvedVariables.join(', ')}
- NO unauthorized variables allowed
- Use ONLY these variables: ${approvedVariables.join(', ')}
- MANDATORY: Use ALL ${maxVariables} variables in the content
- Each variable MUST appear at least once: ${approvedVariables.join(', ')}
- NO unauthorized variables beyond ${approvedVariables.join(', ')} allowed
- FAILURE TO USE ALL VARIABLES WILL RESULT IN REJECTION`;
  }

  // Get use case specific guidance
  const useCaseGuidance = getUseCaseGuidance(goal, category);
  
  // Build custom instructions
  let customInstructions = '';
  if (custom_prompt && custom_prompt.trim()) {
    customInstructions = `
CUSTOM INSTRUCTIONS (CRITICAL):
"${custom_prompt}"
- Incorporate these instructions throughout the content
- These are brand-specific requirements that MUST be followed`;
  }

  // Build LTO instructions
  let ltoInstructions = '';
  if (isLTO && ltoTitle) {
    ltoInstructions = `
LIMITED TIME OFFER REQUIREMENTS:
- This is a LIMITED TIME OFFER template
- LTO Title: "${ltoTitle}" (already displayed in header)
- Expiration: ${ltoExpirationDate ? new Date(ltoExpirationDate).toLocaleDateString() : 'Soon'}
- Create URGENCY and SCARCITY in the message
- Focus on time-sensitive benefits
- Drive immediate action before expiration`;
  }

  // Build button instructions based on template type
  let buttonInstructions = '';
  if (addButtons && buttonConfig && buttonConfig.text) {
    buttonInstructions = getButtonInstructions(templateType, buttonConfig);
  }

  // Get content length guidance based on template type
  const lengthGuidance = getLengthGuidance(templateType);

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

${ltoInstructions}

${useCaseGuidance}

${buttonInstructions}

${lengthGuidance}

CRITICAL REQUIREMENTS:
1. MAXIMUM 1024 characters for message body (STRICT LIMIT)
2. Use ALL approved variables: ${approvedVariables.join(', ')} - EVERY SINGLE ONE
3. Follow ${templateType} template format exactly
4. Comply with ${category} category restrictions
5. Match ${tone} tone consistently
6. Include strategic emojis (2-3 maximum for brevity)
7. Use proper line breaks (\\n for single, \\n\\n for paragraph)
8. MANDATORY: Include every selected variable in meaningful context

CONTENT STRUCTURE FOR ${templateType}:
${getContentStructure(templateType, goal, maxVariables)}

Generate ONLY the message body content. Keep it UNDER 1024 characters and Meta-compliant for ${templateType} templates.`;
}

function getTemplateTypeSpecs(templateType, carouselCards) {
  const specs = {
    'Text': `
TEXT TEMPLATE SPECIFICATIONS:
- Plain text message only
- No media attachments
- Focus on compelling copy
- Maximum 1024 characters
- Can include variables and buttons
- Most flexible template type`,

    'Image': `
IMAGE TEMPLATE SPECIFICATIONS:
- Single image attachment (JPG, PNG)
- Text caption under 1024 characters
- Image should complement the message
- Focus on visual storytelling
- Can include variables and buttons
- Image is displayed above text`,

    'Video': `
VIDEO TEMPLATE SPECIFICATIONS:
- Single video attachment (MP4, max 16MB)
- Text caption under 1024 characters
- Video should be engaging and relevant
- Keep message concise as video is main content
- Can include variables and buttons
- Video plays above text`,

    'Document': `
DOCUMENT TEMPLATE SPECIFICATIONS:
- Single document attachment (PDF, DOC, etc.)
- Text message under 1024 characters
- Document should provide value (catalog, brochure, etc.)
- Message should explain document purpose
- Can include variables and buttons
- Document icon shown with filename`,

    'Carousel': `
CAROUSEL TEMPLATE SPECIFICATIONS:
- Multiple cards (${carouselCards || 2}-10 cards maximum)
- Generate ${carouselCards || 2} individual cards
- Each card: title (max 60 chars), content (max 160 chars)
- Main intro message (max 200 chars) introduces the carousel
- Cards showcase different aspects/benefits/features
- Buttons are shared across all cards
- Focus on variety and choice
- Horizontal scrollable format

CAROUSEL OUTPUT FORMAT (JSON):
{
  "intro": "Browse our amazing collection below:",
  "cards": [
    "Card 1 content here...",
    "Card 2 content here...",
    "Card 3 content here..."
  ]
}`,

    'Limited Time Offer': `
LIMITED TIME OFFER SPECIFICATIONS:
- Urgency-focused messaging
- Clear offer details and expiration
- Compelling value proposition
- Strong call-to-action
- Can include countdown or deadline
- Maximum 1024 characters
- Must create immediate action motivation`
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
- Emojis allowed for engagement
- Must provide clear value proposition`,

    'Utility': `
UTILITY CATEGORY RULES:
- Transactional/informational content only
- NO promotional language
- Must provide genuine utility/service
- Order updates, confirmations, reminders
- Cannot include marketing messages
- Professional tone required
- Focus on information delivery`,

    'Authentication': `
AUTHENTICATION CATEGORY RULES:
- OTP, verification codes only
- Extremely strict content rules
- NO promotional content whatsoever
- Must be purely functional
- Short, direct messages only
- No emojis or marketing language
- Maximum security and clarity`
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
- Include clear next step
- Focus on value and convenience`,

    'Order Confirmation': `
USE CASE: ORDER CONFIRMATION
- Confirm purchase details clearly
- Express gratitude for the order
- Provide order number and timeline
- Build confidence in the purchase
- Set expectations for next steps
- Professional and reassuring tone`,

    'Delivery Reminder': `
USE CASE: DELIVERY REMINDER
- Inform about upcoming delivery
- Provide timing and preparation details
- Include tracking information if available
- Professional and helpful tone
- Clear contact information
- Set proper expectations`,

    'COD Confirmation': `
USE CASE: COD CONFIRMATION
- Confirm cash-on-delivery order
- State exact amount to be paid
- Provide order details clearly
- Include confirmation/cancellation options
- Professional and clear communication
- No ambiguity in terms`,

    'Sale Offer': `
USE CASE: SALE OFFER
- Highlight the offer clearly
- Create appropriate urgency
- Show value proposition
- Include clear terms and conditions
- Strong call-to-action
- Time-bound messaging`,

    'Custom': `
USE CASE: CUSTOM TEMPLATE
- Focus on the specific communication goal
- Provide relevant information clearly
- Match the intended purpose
- Professional and engaging tone
- Clear next steps or actions
- Adapt to user requirements`
  };

  return guidance[goal] || guidance['Custom'];
}

function getButtonInstructions(templateType, buttonConfig) {
  const baseInstructions = `
BUTTON CONFIGURATION:
- Type: ${buttonConfig.type}
- Text: "${buttonConfig.text}"
- Subtype: ${buttonConfig.subtype || 'N/A'}
${buttonConfig.url ? `- URL: ${buttonConfig.url}` : ''}
${buttonConfig.phone ? `- Phone: ${buttonConfig.phone}` : ''}

IMPORTANT: Do NOT include button text in message body. Buttons are separate elements.`;

  const templateSpecificInstructions = {
    'Carousel': `
${baseInstructions}
- Each carousel card can have its own button
- Main message should introduce the carousel concept
- Don't mention specific button actions in main text`,

    'Limited Time Offer': `
${baseInstructions}
- Button should reinforce urgency
- Main message should build toward button action
- Create natural flow to button press`,

    'Text': baseInstructions,
    'Image': baseInstructions,
    'Video': baseInstructions,
    'Document': baseInstructions
  };

  return templateSpecificInstructions[templateType] || baseInstructions;
}

function getLengthGuidance(templateType) {
  const guidance = {
    'Text': 'Aim for 600-800 characters to maximize impact while staying under limit.',
    'Image': 'Keep text concise (300-500 chars) as image is the main focus.',
    'Video': 'Brief text (200-400 chars) as video carries the main message.',
    'Document': 'Moderate length (400-600 chars) to explain document value.',
    'Carousel': 'Concise intro (200-400 chars) as cards contain the details.',
    'Limited Time Offer': 'Punchy and urgent (500-700 chars) to drive immediate action.'
  };

  return `LENGTH GUIDANCE: ${guidance[templateType] || guidance['Text']}`;
}

function getContentStructure(templateType, goal, maxVariables) {
  const baseStructure = maxVariables > 0 
    ? `1. Personalized greeting using {{1}}\n2. Context for ${goal}\n3. Value proposition\n4. Clear next step`
    : `1. Engaging greeting\n2. Context for ${goal}\n3. Value proposition\n4. Clear next step`;

  const templateStructures = {
    'Text': baseStructure,
    
    'Image': `1. Brief intro (image will show details)\n2. Context for ${goal}\n3. Call-to-action`,
    
    'Video': `1. Hook to watch video\n2. Brief context for ${goal}\n3. Encourage action`,
    
    'Document': `1. Document introduction\n2. Value explanation for ${goal}\n3. Download encouragement`,
    
    'Carousel': `1. Introduce the selection/options\n2. Brief context for ${goal}\n3. Encourage browsing`,
    
    'Limited Time Offer': `1. Urgent opening\n2. Offer details for ${goal}\n3. Time pressure\n4. Immediate action required`
  };

  return templateStructures[templateType] || baseStructure;
}