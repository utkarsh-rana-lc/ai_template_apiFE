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
    console.log('Product-aware template request:', body);
    
    // Validate required fields
    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return new Response(JSON.stringify({
        error: 'Products array is required and must not be empty',
        success: false
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    if (!body.goal || !body.tone || !body.language) {
      return new Response(JSON.stringify({
        error: 'Goal, tone, and language are required',
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
    
    // Generate templates for each product
    const templates = [];
    
    for (const product of body.products) {
      const prompt = buildProductAwarePrompt(
        product,
        body.goal,
        body.tone,
        body.language,
        body.variables || [],
        body.custom_prompt || '',
        body.add_buttons || false,
        body.button_config || null
      );
      
      console.log(`Generating template for ${product.name}`);
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are an expert WhatsApp Business template writer specializing in product-specific messaging. Create engaging, personalized templates that highlight product benefits and drive action. Always include strategic emoji usage and proper formatting for WhatsApp." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          max_tokens: 400,
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.4
        });
        
        const content = response.choices[0].message.content.trim();
        console.log(`Generated content for ${product.name}:`, content);
        
        // Parse the structured response
        const parsedTemplate = parseTemplateResponse(content, product.name, body.variables || []);
        templates.push(parsedTemplate);
        
      } catch (error) {
        console.error(`Error generating template for ${product.name}:`, error);
        
        // Fallback template for this product
        const fallbackTemplate = createFallbackTemplate(product, body.goal, body.tone, body.variables || []);
        templates.push(fallbackTemplate);
      }
    }
    
    return new Response(JSON.stringify(templates), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Product-aware template generation error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
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

function buildProductAwarePrompt(product, goal, tone, language, variables, customPrompt, addButtons, buttonConfig) {
  const variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
  
  const contextualGuidance = getProductContextualGuidance(goal, product);
  const toneGuidance = getToneGuidance(tone);
  const languageGuidance = getLanguageGuidance(language);
  
  let buttonInstructions = '';
  if (addButtons && buttonConfig) {
    buttonInstructions = `\nBUTTON REQUIREMENTS:
- Add a ${buttonConfig.type} button with text: "${buttonConfig.text}"
- Button should be relevant to the ${goal} context
- Include button in the BUTTONS section of your response`;
  }

  return `You are creating a WhatsApp Business template for a specific product.

PRODUCT INFORMATION:
- Name: ${product.name}
- Description: ${product.description}
- Context: ${contextualGuidance.context}

TEMPLATE REQUIREMENTS:
- Use Case: ${goal}
- Tone: ${tone} (${toneGuidance})
- Language: ${language} (${languageGuidance})
- Target: ${contextualGuidance.audience}

VARIABLES TO INCLUDE:
${variableDefinitions}

CUSTOM INSTRUCTIONS:
${customPrompt || 'None'}

${buttonInstructions}

FORMATTING REQUIREMENTS:
- MUST include 4-5 relevant emojis strategically placed
- MUST use proper line breaks (\\n\\n for paragraphs)
- MUST be under 1000 characters total
- MUST sound natural and ${tone.toLowerCase()}, NOT robotic
- MUST highlight product benefits and features
- MUST create urgency/desire appropriate for ${goal}

RESPONSE FORMAT (MANDATORY):
Structure your response exactly like this:

HEADER: [Engaging header with emoji]

BODY: [Main message content with product focus, proper line breaks, and strategic emojis]

FOOTER: [Brief footer if needed]

VARIABLES: [List the variables used: {{1}} = Customer Name, {{2}} = Product Name, etc.]

Generate ONLY the template content in this exact format. Make it product-specific, engaging, and perfect for ${goal}.`;
}

function parseTemplateResponse(content, productName, variables) {
  const lines = content.split('\n');
  let header = '';
  let body = '';
  let footer = '';
  let variableMap = {};
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('HEADER:')) {
      currentSection = 'header';
      header = trimmedLine.replace('HEADER:', '').trim();
    } else if (trimmedLine.startsWith('BODY:')) {
      currentSection = 'body';
      body = trimmedLine.replace('BODY:', '').trim();
    } else if (trimmedLine.startsWith('FOOTER:')) {
      currentSection = 'footer';
      footer = trimmedLine.replace('FOOTER:', '').trim();
    } else if (trimmedLine.startsWith('VARIABLES:')) {
      currentSection = 'variables';
    } else if (currentSection === 'body' && trimmedLine) {
      body += (body ? '\n\n' : '') + trimmedLine;
    } else if (currentSection === 'footer' && trimmedLine) {
      footer += (footer ? '\n' : '') + trimmedLine;
    } else if (currentSection === 'variables' && trimmedLine.includes('=')) {
      const [key, value] = trimmedLine.split('=').map(s => s.trim());
      if (key && value) {
        variableMap[key] = value;
      }
    }
  }
  
  // If parsing failed, treat entire content as body
  if (!header && !body) {
    body = content;
  }
  
  // Create variable mapping based on provided variables
  if (Object.keys(variableMap).length === 0) {
    variables.forEach((variable, index) => {
      variableMap[`{{${index + 1}}}`] = variable;
    });
  }
  
  return {
    product: productName,
    header: header || `👋 Hey {{1}}!`,
    body: body || `Your ${productName} is waiting for you! 🌟\n\nDon't miss out on this amazing product! ✨`,
    footer: footer || '',
    variables: variableMap
  };
}

function createFallbackTemplate(product, goal, tone, variables) {
  const variableMap = {};
  variables.forEach((variable, index) => {
    variableMap[`{{${index + 1}}}`] = variable;
  });
  
  const fallbackTemplates = {
    'Abandoned Checkout': {
      header: `👋 Hey {{1}}!`,
      body: `You left ${product.name} in your cart! 🛒\n\n${product.description}\n\nComplete your purchase now and get glowing results! ✨\n\nDon't miss out! 💫`,
      footer: 'Limited time offer. Shop now!'
    },
    'Order Confirmation': {
      header: `🎉 Order Confirmed!`,
      body: `Hi {{1}}, great news! ✅\n\nYour ${product.name} order is confirmed!\n\n${product.description}\n\nWe'll deliver it soon! 📦`,
      footer: 'Thank you for choosing us!'
    },
    'Upsell': {
      header: `🌟 Perfect Match!`,
      body: `Hi {{1}}, since you love great products... 💫\n\nTry ${product.name}! ${product.description}\n\nSpecial offer just for you! 🎁\n\nUpgrade your routine today! ✨`,
      footer: 'Limited time offer!'
    }
  };
  
  const template = fallbackTemplates[goal] || fallbackTemplates['Upsell'];
  
  return {
    product: product.name,
    header: template.header,
    body: template.body,
    footer: template.footer,
    variables: variableMap
  };
}

function getProductContextualGuidance(goal, product) {
  const contexts = {
    'Abandoned Checkout': {
      audience: 'Customers who left products in cart',
      context: `Gently remind about ${product.name} left in cart. Highlight product benefits from description: "${product.description}". Create mild urgency without being pushy. Focus on value and results they'll get.`
    },
    'Order Confirmation': {
      audience: 'Customers who just purchased',
      context: `Confirm ${product.name} purchase. Reference product benefits: "${product.description}". Show excitement and gratitude. Provide reassurance about their choice.`
    },
    'Upsell': {
      audience: 'Existing customers',
      context: `Recommend ${product.name} as complementary product. Highlight unique benefits: "${product.description}". Show how it enhances their current routine/purchase.`
    },
    'Cross-sell': {
      audience: 'Customers viewing related products',
      context: `Suggest ${product.name} as perfect addition. Use product description: "${product.description}" to show complementary benefits. Create desire for complete solution.`
    },
    'Product Launch': {
      audience: 'Interested customers and subscribers',
      context: `Introduce new ${product.name} with excitement. Highlight innovative features: "${product.description}". Create anticipation and early-bird urgency.`
    },
    'Restock Alert': {
      audience: 'Customers waiting for product',
      context: `Notify that ${product.name} is back in stock. Remind of benefits: "${product.description}". Create urgency due to high demand and limited quantity.`
    },
    'Review Request': {
      audience: 'Customers who purchased recently',
      context: `Request review for ${product.name}. Reference their experience with product benefits: "${product.description}". Make it easy and show appreciation.`
    }
  };
  
  return contexts[goal] || contexts['Upsell'];
}

function getToneGuidance(tone) {
  const toneGuides = {
    'Conversational': 'Friendly, natural, like talking to a friend. Use contractions and casual language.',
    'Persuasive': 'Compelling but not aggressive. Focus on benefits and create desire.',
    'Informative': 'Clear, factual, helpful. Provide value through information.',
    'Promotional': 'Exciting, offer-focused. Highlight deals and limited-time opportunities.',
    'Friendly': 'Warm, approachable, supportive. Make customer feel valued and cared for.'
  };
  
  return toneGuides[tone] || toneGuides['Conversational'];
}

function getLanguageGuidance(language) {
  const languageGuides = {
    'English': 'Use clear, professional English. Modern business communication style.',
    'Hindi': 'Use simple Hindi with appropriate honorifics (आप, जी). Cultural sensitivity.'
  };
  
  return languageGuides[language] || languageGuides['English'];
}