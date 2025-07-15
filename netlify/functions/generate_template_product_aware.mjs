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
  // CRITICAL: Only use exactly the variables provided, no more, no less
  let variableDefinitions = '';
  let variableList = '';
  let variableInstructions = '';
  
  if (variables.length === 0) {
    // No variables selected - generate content without any variables
    variableDefinitions = 'NO VARIABLES SELECTED - Do not use any {{}} placeholders';
    variableList = 'NONE';
    variableInstructions = 'CRITICAL: Do NOT use any {{1}}, {{2}} or any variable placeholders. Generate plain text content only.';
  } else {
    // Use exactly the selected variables
    variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
    variableList = variables.map((_, i) => `{{${i+1}}}`).join(', ');
    variableInstructions = `CRITICAL VARIABLE RULES:
- You MUST use EXACTLY these ${variables.length} variables: ${variableList}
- Do NOT create additional variables like {{${variables.length + 1}}}, {{${variables.length + 2}}} etc.
- Each variable must appear at least once in the message
- Do NOT use any variables not in this list: ${variableList}
- If you use a variable not in the approved list, the template will be REJECTED`;
  }
  
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

  return `You are creating a WhatsApp Business template for a specific product. Generate engaging, emoji-rich content that follows Meta's guidelines.

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

${variableInstructions}

VARIABLE USAGE EXAMPLES (ONLY if variables are selected):
${variables.length > 0 ? `
- {{1}} for ${variables[0]} in greeting
${variables.length > 1 ? `- {{2}} for ${variables[1]} in body` : ''}
${variables.length > 2 ? `- {{3}} for ${variables[2]} in context` : ''}
${variables.length > 3 ? `- {{4}} for ${variables[3]} in details` : ''}
${variables.length > 4 ? `- {{5}} for ${variables[4]} in closing` : ''}
` : 'NO VARIABLES - Generate plain text content only'}

CUSTOM INSTRUCTIONS:
${customPrompt || 'None'}

${buttonInstructions}

CRITICAL FORMATTING REQUIREMENTS:
- MUST include 4-6 relevant emojis strategically placed throughout
- MUST use proper line breaks (\\n\\n for paragraph separation)
- MUST be under 1000 characters total (WhatsApp limit)
- MUST sound natural and ${tone.toLowerCase()}, NOT robotic
- MUST highlight ${product.name} benefits from description
- MUST create appropriate urgency for ${goal}
- MUST follow Meta's WhatsApp Business guidelines
- MUST use ONLY the approved variables: ${variableList}
- MUST include product-specific details and benefits
- MUST NOT create or use variables not in the approved list

CONTENT STRUCTURE:
Generate a single flowing message that includes:
1. ${variables.length > 0 ? `Personalized greeting with {{1}} (${variables[0]}) and relevant emoji` : 'Generic greeting with relevant emoji'}
2. Context about ${product.name} and situation
3. Product benefits from description with emojis
4. ${variables.length > 1 ? `Include other variables naturally: ${variables.slice(1).map((v, i) => `{{${i+2}}} (${v})`).join(', ')}` : 'No additional variables to include'}
5. Call to action appropriate for ${goal}
6. Closing with brand voice and emoji

${variables.length > 0 ? `VARIABLE INTEGRATION EXAMPLES (use ONLY these patterns):
${variables.length === 1 ? `- "Hi {{1}}, your ${product.name} is ready!"` : ''}
${variables.length === 2 ? `- "Hi {{1}}, your {{2}} is ready!"` : ''}
${variables.length === 3 ? `- "Hi {{1}}, your {{2}} order {{3}} is ready!"` : ''}
${variables.length >= 4 ? `- "Hi {{1}}, get {{4}} off on {{2}} with code {{3}}!"` : ''}
` : 'NO VARIABLE EXAMPLES - Generate plain text only'}

FINAL VALIDATION CHECKLIST:
- ✅ Used exactly ${variables.length} variables (no more, no less)
- ✅ Variables used: ${variableList}
- ✅ No unauthorized variables created
- ✅ Product name "${product.name}" mentioned
- ✅ Product benefits included
- ✅ Under 1000 characters
- ✅ 4-6 emojis included
- ✅ Proper line breaks used

Generate ONLY the message content as a single flowing text. No sections, no formatting markers, just the WhatsApp message content that uses EXACTLY the specified variables.`;
}

function parseTemplateResponse(content, productName, variables) {
  // Clean and validate the content
  const cleanContent = content.trim();
  
  // CRITICAL: Validate that only approved variables are used
  const approvedVariables = variables.map((_, i) => `{{${i+1}}}`);
  const variableRegex = /\{\{\d+\}\}/g;
  const foundVariables = cleanContent.match(variableRegex) || [];
  
  // Check for unauthorized variables
  const unauthorizedVars = foundVariables.filter(v => !approvedVariables.includes(v));
  if (unauthorizedVars.length > 0) {
    console.warn(`Unauthorized variables found: ${unauthorizedVars.join(', ')}`);
    // Remove unauthorized variables
    let sanitizedContent = cleanContent;
    unauthorizedVars.forEach(unauthorizedVar => {
      sanitizedContent = sanitizedContent.replace(new RegExp(unauthorizedVar.replace(/[{}]/g, '\\$&'), 'g'), '[REMOVED]');
    });
  }
  
  // Create variable mapping based on ONLY provided variables
  const variableMap = {};
  variables.forEach((variable, index) => {
    variableMap[`{{${index + 1}}}`] = variable;
  });
  
  // Return the content as a single body (no header/footer splitting)
  const finalContent = unauthorizedVars.length > 0 ? sanitizedContent : cleanContent;
  
  return {
    product: productName,
    content: finalContent,
    variables: variableMap
  };
}

function createFallbackTemplate(product, goal, tone, variables) {
  // Create fallback that respects the exact number of variables selected
  const variableMap = {};
  variables.forEach((variable, index) => {
    variableMap[`{{${index + 1}}}`] = variable;
  });
  
  // Generate fallback content based on number of variables
  let fallbackContent = '';
  
  if (variables.length === 0) {
    // No variables - plain text
    fallbackContent = `Your ${product.name} is waiting for you! 🌟\n\n${product.description}\n\nComplete your purchase now and get amazing results! ✨\n\nDon't miss out on this deal! 💫`;
  } else if (variables.length === 1) {
    // One variable only
    fallbackContent = `${variables[0] === 'Customer Name' ? '{{1}}' : 'Hi there'}, your ${product.name} is waiting! 🌟\n\n${product.description}\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
  } else if (variables.length === 2) {
    // Two variables only
    fallbackContent = `{{1}}, your {{2}} is waiting! 🌟\n\n${product.description}\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
  } else {
    // Multiple variables - use them all
    const varUsage = variables.map((_, i) => `{{${i+1}}}`).slice(0, Math.min(variables.length, 4));
    fallbackContent = `${varUsage[0]}, your ${varUsage[1] || product.name} is ready! 🌟\n\n${product.description}\n\n${varUsage[2] ? `Order: ${varUsage[2]}` : 'Complete your purchase now!'} ✨\n\n${varUsage[3] ? `Delivery: ${varUsage[3]}` : 'Don\'t miss out!'} 💫`;
  }
  
  return {
    product: product.name,
    content: fallbackContent,
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