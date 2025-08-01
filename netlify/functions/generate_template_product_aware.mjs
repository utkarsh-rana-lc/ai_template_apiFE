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
        error: 'Goal, tone, language, category, and template_type are required',
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
        body.category || 'Marketing',
        body.template_type || 'Text',
        body.variables || [],
        body.custom_prompt || '',
        body.add_buttons || false,
        body.button_config || null,
        body.regenerate || false,
        body.timestamp || Date.now()
      );
      
      console.log(`Generating template for ${product.name}`);
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `You are an expert WhatsApp Business template writer specializing in product-specific messaging. Create engaging, personalized templates that highlight product benefits and drive action. Always include strategic emoji usage and proper formatting for WhatsApp.
            
            ${body.regenerate ? 'REGENERATION MODE: Create completely different content with fresh language, new structure, different emojis, and varied approach. Avoid repetitive patterns.' : ''}` 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          max_tokens: 400,
          temperature: body.regenerate ? 1.0 : 0.8, // Much higher creativity for regeneration
          top_p: 0.9,
          frequency_penalty: body.regenerate ? 0.8 : 0.3, // Much higher penalty for repetition
          presence_penalty: body.regenerate ? 0.9 : 0.4 // Much more variation for regeneration
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

function buildProductAwarePrompt(product, goal, tone, language, category, templateType, variables, customPrompt, addButtons, buttonConfig, isRegeneration = false, timestamp = Date.now()) {
  // BULLETPROOF VARIABLE VALIDATION
  const maxVariables = variables.length;
  const approvedVariables = variables.map((_, i) => `{{${i+1}}}`);
  
  let variableSection = '';
  if (maxVariables === 0) {
    variableSection = `
CRITICAL: NO VARIABLES SELECTED
- Do NOT use any {{1}}, {{2}}, {{3}} or ANY variable placeholders
- Generate PLAIN TEXT content only
- Any use of {{}} will result in IMMEDIATE REJECTION
- Create engaging, personalized content without variable placeholders`;
  } else {
    const variableList = variables.map((v, i) => `{{${i+1}}} = ${v}`).join(', ');
    variableSection = `
CRITICAL VARIABLE RESTRICTIONS:
- MAXIMUM ${maxVariables} variables allowed: ${approvedVariables.join(', ')}
- Variable mapping: ${variableList}
- You CANNOT use {{${maxVariables + 1}}}, {{${maxVariables + 2}}} or any higher numbers
- You CANNOT create new variables beyond the approved list
- Each approved variable MUST be used at least once
- Using unauthorized variables = IMMEDIATE TEMPLATE REJECTION

APPROVED VARIABLES ONLY: ${approvedVariables.join(', ')}
FORBIDDEN: Any variable not in the above list`;
  }
  
  const contextualGuidance = getProductContextualGuidance(goal, product);
  const toneGuidance = getToneGuidance(tone);
  const languageGuidance = getLanguageGuidance(language);
  
  const regenerationNote = isRegeneration ? `
REGENERATION REQUEST (TIMESTAMP: ${timestamp}):
- This is a REGENERATION - create COMPLETELY DIFFERENT content
- Use FRESH language, different structure, new emojis
- AVOID repeating previous patterns or phrases
- Be MORE CREATIVE and VARIED in your approach
- Generate UNIQUE content that feels completely new
` : '';
  
  let buttonInstructions = '';
  if (addButtons && buttonConfig) {
    buttonInstructions = `
BUTTON CONFIGURATION:
- Button Type: ${buttonConfig.type}
- Button Text: "${buttonConfig.text}"
- Button Subtype: ${buttonConfig.subtype || 'N/A'}
- URL: ${buttonConfig.url || 'N/A'}
- Phone: ${buttonConfig.phone || 'N/A'}

IMPORTANT: Do NOT include button text in the message body. Buttons are separate UI elements.
The message should flow naturally and encourage the action that the button will provide.`;
  }

  let customInstructions = '';
  if (customPrompt && customPrompt.trim()) {
    customInstructions = `
CUSTOM INSTRUCTIONS FROM USER:
"${customPrompt}"

CRITICAL: Incorporate these custom instructions throughout your content creation. These are specific brand guidelines or requirements that MUST be followed.`;
  }

  return `You are the world's top marketing content writer creating a WhatsApp Business template for a specific product. This template must be exceptional, engaging, and drive outstanding results.

PRODUCT INFORMATION:
- Name: ${product.name}
- Description: ${product.description}
- Image: Available for visual context

TEMPLATE REQUIREMENTS:
- Use Case: ${goal}
- Tone: ${tone} (${toneGuidance})
- Language: ${language} (${languageGuidance})
- Category: ${category}
- Template Type: ${templateType}

${variableSection}

${customInstructions}

${regenerationNote}

${buttonInstructions}

WORLD-CLASS CONTENT REQUIREMENTS:
1. PERFECT SALUTATION: Start with an engaging, warm greeting that creates immediate connection
2. PRODUCT FOCUS: Highlight ${product.name} and its key benefits from the description
3. EMOTIONAL ENGAGEMENT: Create desire and connection with the product
4. VALUE PROPOSITION: Clearly communicate why they need this product
5. STRATEGIC EMOJI USAGE: Use 4-6 relevant emojis that enhance the message
6. PROPER FORMATTING: Use line breaks (\\n\\n) for paragraph separation
7. COMPELLING NARRATIVE: Tell a story that resonates with ${goal}
8. CALL TO ACTION: Create urgency and desire for immediate action

CONTENT STRUCTURE (MANDATORY):
1. ENGAGING SALUTATION (personalized greeting with emoji)
2. PRODUCT HOOK (grab attention with product benefit)
3. VALUE PROPOSITION (what's in it for them)
4. PRODUCT DETAILS (highlight key benefits from description)
5. URGENCY/SCARCITY (create action motivation)
6. CLEAR NEXT STEP (guide toward desired action)

QUALITY STANDARDS:
- Every sentence must be purposeful and engaging
- Content must feel personal and product-specific
- Tone must be consistent and ${tone.toLowerCase()}
- Message should build momentum toward action
- Must highlight specific product benefits
- Should create emotional connection to the product

${maxVariables > 0 ? `
VARIABLE USAGE PATTERNS (MANDATORY):
${maxVariables === 1 ? `- Start with personalized greeting: "Hi {{1}}, [engaging hook about ${product.name}]..."` : ''}
${maxVariables === 2 ? `- Pattern: "Hi {{1}}, your {{2}} [compelling message about ${product.name}]..."` : ''}
${maxVariables === 3 ? `- Pattern: "Hi {{1}}, your {{2}} order {{3}} [engaging content about ${product.name}]..."` : ''}
${maxVariables >= 4 ? `- Use all variables naturally throughout the message flow` : ''}
` : ''}

FINAL VALIDATION CHECKLIST:
- ✅ Used exactly ${maxVariables} variables (no more, no less)
- ✅ Only used approved variables: ${approvedVariables.join(', ')}
- ✅ No unauthorized variables like {{${maxVariables + 1}}}, {{${maxVariables + 2}}} etc.
- ✅ Product name "${product.name}" mentioned
- ✅ Product benefits included
- ✅ Engaging salutation that builds connection
- ✅ Compelling content that drives action
- ✅ Under 1000 characters
- ✅ 4-6 strategic emojis included
- ✅ Proper line breaks used
- ✅ Perfect ${tone.toLowerCase()} tone throughout
- ✅ Custom instructions incorporated (if provided)

${regenerationNote}

Generate ONLY the WhatsApp message body content. Make it exceptional - this template represents a premium brand and must drive outstanding results for ${product.name}.`;
}

function parseTemplateResponse(content, productName, variables) {
  const cleanContent = content.trim();
  const maxVariables = variables.length;
  const approvedVariables = variables.map((_, i) => `{{${i+1}}}`);
  
  // BULLETPROOF VALIDATION: Check for unauthorized variables
  const variableRegex = /\{\{\d+\}\}/g;
  const foundVariables = cleanContent.match(variableRegex) || [];
  const uniqueFoundVariables = [...new Set(foundVariables)];
  
  console.log(`Product: ${productName}`);
  console.log(`Max variables allowed: ${maxVariables}`);
  console.log(`Approved variables: ${approvedVariables.join(', ')}`);
  console.log(`Found variables: ${uniqueFoundVariables.join(', ')}`);
  
  // Find unauthorized variables
  const unauthorizedVars = uniqueFoundVariables.filter(v => !approvedVariables.includes(v));
  
  if (unauthorizedVars.length > 0) {
    console.error(`❌ UNAUTHORIZED VARIABLES DETECTED for ${productName}:`);
    console.error(`Unauthorized: ${unauthorizedVars.join(', ')}`);
    console.error(`Only allowed: ${approvedVariables.join(', ')}`);
    
    // REMOVE unauthorized variables completely
    let sanitizedContent = cleanContent;
    unauthorizedVars.forEach(unauthorizedVar => {
      const regex = new RegExp(unauthorizedVar.replace(/[{}]/g, '\\$&'), 'g');
      sanitizedContent = sanitizedContent.replace(regex, '[VARIABLE_REMOVED]');
    });
    
    console.log(`✅ Sanitized content: ${sanitizedContent}`);
    
    // Use sanitized content
    const finalContent = sanitizedContent;
    
    // Create variable mapping for ONLY approved variables
    const variableMap = {};
    variables.forEach((variable, index) => {
      variableMap[`{{${index + 1}}}`] = variable;
    });
    
    return {
      product: productName,
      content: finalContent,
      variables: variableMap
    };
  }
  
  // Validate variable count
  if (maxVariables > 0 && uniqueFoundVariables.length !== maxVariables) {
    console.warn(`⚠️ Variable count mismatch for ${productName}:`);
    console.warn(`Expected: ${maxVariables}, Found: ${uniqueFoundVariables.length}`);
  }
  
  // Create variable mapping for approved variables only
  const variableMap = {};
  variables.forEach((variable, index) => {
    variableMap[`{{${index + 1}}}`] = variable;
  });
  
  console.log(`✅ Valid template generated for ${productName}`);
  
  return {
    product: productName,
    content: cleanContent,
    variables: variableMap
  };
}

function createFallbackTemplate(product, goal, tone, variables) {
  console.log(`Creating fallback template for ${product.name} with ${variables.length} variables`);
  
  // BULLETPROOF fallback that uses EXACTLY the selected variables
  const variableMap = {};
  variables.forEach((variable, index) => {
    variableMap[`{{${index + 1}}}`] = variable;
  });
  
  // Generate fallback content using EXACTLY the selected variables
  let fallbackContent = '';
  const maxVars = variables.length;
  
  if (maxVars === 0) {
    // No variables - plain text
    fallbackContent = `Your ${product.name} is waiting for you! 🌟\n\n${product.description.substring(0, 100)}...\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
  } else if (maxVars === 1) {
    // One variable only
    fallbackContent = `{{1}}, your ${product.name} is waiting! 🌟\n\n${product.description.substring(0, 80)}...\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
  } else if (maxVars === 2) {
    // Two variables only
    fallbackContent = `{{1}}, your {{2}} is waiting! 🌟\n\n${product.description.substring(0, 70)}...\n\nComplete your purchase now! ✨\n\nDon't miss out! 💫`;
  } else if (maxVars === 3) {
    // Three variables only
    fallbackContent = `{{1}}, your {{2}} order {{3}} is ready! 🌟\n\n${product.description.substring(0, 60)}...\n\nComplete your purchase! ✨\n\nDon't miss out! 💫`;
  } else if (maxVars === 4) {
    // Four variables only
    fallbackContent = `{{1}}, your {{2}} with {{3}} expires {{4}}! 🌟\n\n${product.description.substring(0, 50)}...\n\nAct now! ✨\n\nDon't miss out! 💫`;
  } else if (maxVars === 5) {
    // Five variables only
    fallbackContent = `{{1}}, get {{5}} off {{2}}! Order {{3}} delivers {{4}}! 🌟\n\n${product.description.substring(0, 40)}...\n\nAct now! ✨`;
  }
  
  // Validate fallback doesn't have unauthorized variables
  const foundVars = fallbackContent.match(/\{\{\d+\}\}/g) || [];
  const uniqueFoundVars = [...new Set(foundVars)];
  const approvedVars = variables.map((_, i) => `{{${i+1}}}`);
  const unauthorized = uniqueFoundVars.filter(v => !approvedVars.includes(v));
  
  if (unauthorized.length > 0) {
    console.error(`❌ Fallback template has unauthorized variables: ${unauthorized.join(', ')}`);
    // Remove unauthorized variables from fallback
    unauthorized.forEach(unauthorizedVar => {
      const regex = new RegExp(unauthorizedVar.replace(/[{}]/g, '\\$&'), 'g');
      fallbackContent = fallbackContent.replace(regex, '[REMOVED]');
    });
  }
  
  console.log(`✅ Fallback template created with ${maxVars} variables: ${approvedVars.join(', ')}`);
  
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