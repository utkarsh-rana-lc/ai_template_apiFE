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
    
    // Build comprehensive prompt using ALL user inputs
    const prompt = buildComprehensivePrompt(body);
    
    console.log('Generated prompt:', prompt);
    
    // Generate response with optimized parameters for high-quality content
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are the world's top marketing content writer and WhatsApp Business template expert. You create engaging, persuasive, and highly effective templates that drive action and build brand connection. Your content is always:

- Emotionally engaging with perfect salutations
- Strategically crafted for maximum impact
- Compliant with Meta's WhatsApp Business policies
- Rich with relevant emojis and perfect formatting
- Tailored to the specific use case and audience
- Professional yet conversational and compelling

You NEVER generate generic or basic content. Every template is a masterpiece of marketing communication.` 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.4
    });
    
    const content = response.choices[0].message.content.trim();
    console.log('Generated content:', content);
    
    return new Response(JSON.stringify({
      content: content,
      success: true
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

function buildComprehensivePrompt(data) {
  // Extract all user inputs
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
    buttonConfig
  } = data;

  // Build variable section with strict validation
  const maxVariables = variables.length;
  const approvedVariables = variables.map((_, i) => `{{${i+1}}}`);
  
  let variableSection = '';
  if (maxVariables === 0) {
    variableSection = `
CRITICAL: NO VARIABLES SELECTED
- Do NOT use any {{1}}, {{2}}, {{3}} or ANY variable placeholders
- Generate PLAIN TEXT content only
- Any use of {{}} will result in IMMEDIATE REJECTION
- Create personalized content without variable placeholders`;
  } else {
    const variableList = variables.map((v, i) => `{{${i+1}}} = ${v}`).join(', ');
    variableSection = `
CRITICAL VARIABLE RESTRICTIONS:
- MAXIMUM ${maxVariables} variables allowed: ${approvedVariables.join(', ')}
- Variable mapping: ${variableList}
- You CANNOT use {{${maxVariables + 1}}}, {{${maxVariables + 2}}} or any higher numbers
- Each approved variable MUST be used strategically and meaningfully
- Using unauthorized variables = IMMEDIATE TEMPLATE REJECTION

APPROVED VARIABLES ONLY: ${approvedVariables.join(', ')}`;
  }

  // Get contextual guidance for the specific use case
  const contextualGuidance = getUseCaseGuidance(goal, category);
  const toneGuidance = getToneGuidance(tone);
  const languageGuidance = getLanguageGuidance(language);

  // Build button instructions if buttons are enabled
  let buttonInstructions = '';
  if (addButtons && buttonConfig && buttonConfig.text) {
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

  // Build header/footer instructions
  let headerFooterInstructions = '';
  if (header || footer) {
    headerFooterInstructions = `
HEADER/FOOTER CONTEXT:
${header ? `- Header: "${header}" (This sets the context for your message)` : ''}
${footer ? `- Footer: "${footer}" (This will appear after your message)` : ''}

Your message body should complement these elements, not repeat them.`;
  }

  return `You are creating a world-class WhatsApp Business template that will drive exceptional results. Use ALL the provided information to craft the perfect message.

TEMPLATE SPECIFICATIONS:
- Meta Category: ${category}
- Template Category: ${templateCategory}
- Template Type: ${templateType}
- Use Case: ${goal}
- Language: ${language}
- Tone: ${tone}

${contextualGuidance}

${toneGuidance}

${languageGuidance}

${variableSection}

${headerFooterInstructions}

${buttonInstructions}

WORLD-CLASS CONTENT REQUIREMENTS:
1. PERFECT SALUTATION: Start with an engaging, warm greeting that matches the ${tone} tone
2. EMOTIONAL CONNECTION: Create immediate rapport and connection with the recipient
3. VALUE PROPOSITION: Clearly communicate the benefit or value in the first few lines
4. COMPELLING NARRATIVE: Tell a story that resonates with the ${goal} context
5. STRATEGIC EMOJI USAGE: Use 4-6 relevant emojis that enhance the message (not decorate)
6. PROPER FORMATTING: Use line breaks (\\n\\n) for paragraph separation, single \\n for line breaks
7. CALL TO ACTION: Create urgency and desire for the intended action
8. PROFESSIONAL POLISH: Ensure every word serves a purpose and drives toward the goal

CONTENT STRUCTURE (MANDATORY):
1. ENGAGING SALUTATION (with appropriate emoji)
2. CONTEXT/HOOK (grab attention immediately)
3. VALUE PROPOSITION (what's in it for them)
4. SUPPORTING DETAILS (build the case)
5. URGENCY/SCARCITY (create action motivation)
6. CLEAR NEXT STEP (guide them toward action)

QUALITY STANDARDS:
- Every sentence must be purposeful and engaging
- Language should be sophisticated yet accessible
- Content must feel personal and relevant
- Tone must be consistent throughout
- Message should build momentum toward action
- Must comply with Meta's WhatsApp Business policies

${maxVariables > 0 ? `
VARIABLE USAGE PATTERNS:
${maxVariables === 1 ? `- Start with personalized greeting: "Hi {{1}}, [engaging hook]..."` : ''}
${maxVariables === 2 ? `- Pattern: "Hi {{1}}, your {{2}} [compelling message]..."` : ''}
${maxVariables === 3 ? `- Pattern: "Hi {{1}}, your {{2}} order {{3}} [engaging content]..."` : ''}
${maxVariables >= 4 ? `- Use all variables naturally throughout the message flow` : ''}
` : ''}

FINAL VALIDATION:
- ✅ Uses exactly ${maxVariables} variables: ${approvedVariables.join(', ')}
- ✅ Engaging salutation that builds connection
- ✅ Compelling content that drives action
- ✅ Perfect ${tone} tone throughout
- ✅ Strategic emoji placement (4-6 emojis)
- ✅ Proper line breaks and formatting
- ✅ Under 1000 characters total
- ✅ Meta-compliant content

Generate ONLY the WhatsApp message body content. Make it exceptional - this template will represent a premium brand and must drive outstanding results.`;
}

function getUseCaseGuidance(goal, category) {
  const useCaseContexts = {
    'Abandoned Cart': {
      context: `ABANDONED CART RECOVERY STRATEGY:
- Create gentle urgency without being pushy
- Remind them of the specific value they're missing
- Address potential hesitations or concerns
- Make completion feel easy and rewarding
- Use FOMO (fear of missing out) strategically
- Highlight the benefits they'll gain by completing purchase
- Create emotional connection to the abandoned items`,
      audience: 'Customers who showed purchase intent but didn't complete',
      psychology: 'Overcome abandonment hesitation, create completion motivation'
    },
    'Order Confirmation': {
      context: `ORDER CONFIRMATION EXCELLENCE:
- Celebrate their smart purchase decision
- Build excitement about what's coming
- Provide reassurance and confidence
- Set clear expectations for next steps
- Express genuine gratitude for their trust
- Reinforce the value of their purchase
- Create anticipation for delivery/fulfillment`,
      audience: 'Customers who just completed a purchase',
      psychology: 'Reinforce positive decision, build brand loyalty, create excitement'
    },
    'Delivery Reminder': {
      context: `DELIVERY REMINDER OPTIMIZATION:
- Create excitement about the upcoming delivery
- Provide clear, helpful preparation instructions
- Show care for their convenience and experience
- Build anticipation for product arrival
- Demonstrate reliability and professionalism
- Make them feel valued and important
- Ensure smooth delivery experience`,
      audience: 'Customers expecting a delivery',
      psychology: 'Build anticipation, ensure smooth experience, demonstrate care'
    },
    'COD Confirmation': {
      context: `COD CONFIRMATION STRATEGY:
- Make confirmation feel simple and secure
- Build trust in the COD process
- Provide clear order details and amount
- Create confidence in the transaction
- Make cancellation option clear but not prominent
- Emphasize the convenience of cash payment
- Ensure transparency in all details`,
      audience: 'Customers who chose Cash on Delivery',
      psychology: 'Build trust, ensure clarity, make confirmation easy'
    },
    'Sale Offer': {
      context: `SALE OFFER MASTERY:
- Create immediate excitement about the opportunity
- Highlight exclusive nature of the offer
- Build urgency with time-sensitive language
- Emphasize savings and value proposition
- Make the offer feel special and personalized
- Create FOMO with limited availability
- Drive immediate action with compelling benefits`,
      audience: 'Potential customers interested in promotions',
      psychology: 'Create urgency, highlight value, drive immediate action'
    },
    'Custom': {
      context: `CUSTOM TEMPLATE EXCELLENCE:
- Understand the specific communication goal
- Create relevant, engaging content for the purpose
- Build appropriate emotional connection
- Provide clear value or information
- Guide toward desired action or response
- Maintain professional yet personal tone
- Ensure message serves its intended purpose`,
      audience: 'Target audience based on specific use case',
      psychology: 'Achieve specific communication objective effectively'
    }
  };

  return useCaseContexts[goal] || useCaseContexts['Custom'];
}

function getToneGuidance(tone) {
  const toneGuides = {
    'Conversational': `CONVERSATIONAL TONE MASTERY:
- Write like you're talking to a valued friend
- Use natural, flowing language with personality
- Include conversational connectors and transitions
- Use contractions naturally (we'll, you're, it's, don't)
- Sound warm, approachable, and genuinely interested
- Balance professionalism with friendliness
- Make every sentence feel natural and unforced
- Create immediate rapport and connection`,

    'Informative': `INFORMATIVE TONE EXCELLENCE:
- Provide clear, valuable information efficiently
- Structure content logically and easy to follow
- Use authoritative yet accessible language
- Focus on facts, benefits, and practical details
- Avoid emotional manipulation, focus on value
- Make complex information simple to understand
- Build trust through expertise and clarity
- Guide decision-making with helpful insights`,

    'Persuasive': `PERSUASIVE TONE MASTERY:
- Use compelling language that motivates action
- Build logical arguments with emotional appeal
- Create desire through benefit-focused messaging
- Address objections before they arise
- Use social proof and urgency strategically
- Make the desired action feel inevitable
- Balance logic with emotional triggers
- Guide toward decision with confidence`,

    'Promotional': `PROMOTIONAL TONE EXCELLENCE:
- Generate excitement about offers and opportunities
- Use dynamic, energetic language that motivates
- Create urgency with time-sensitive messaging
- Highlight value propositions and savings
- Make offers feel exclusive and special
- Build FOMO (fear of missing out) strategically
- Drive immediate action with compelling benefits
- Balance excitement with credibility`,

    'Reassuring': `REASSURING TONE MASTERY:
- Use calming, supportive language that builds confidence
- Address concerns proactively and thoroughly
- Provide clear guidance and next steps
- Sound reliable, trustworthy, and competent
- Offer help and support genuinely
- Build security and peace of mind
- Use confident, authoritative language
- Make complex situations feel manageable`
  };

  return toneGuides[tone] || toneGuides['Conversational'];
}

function getLanguageGuidance(language) {
  const languageGuides = {
    'English': `ENGLISH LANGUAGE EXCELLENCE:
- Use sophisticated yet accessible vocabulary
- Employ varied sentence structures for flow
- Maintain consistent, professional tone
- Use active voice for stronger impact
- Choose precise words that convey exact meaning
- Ensure perfect grammar and punctuation
- Create rhythm and flow in the content
- Make language feel natural and engaging`,

    'Hindi': `HINDI LANGUAGE MASTERY:
- Use clear, elegant Hindi with proper grammar
- Include appropriate honorifics (आप, जी) respectfully
- Balance formal and friendly elements naturally
- Use culturally relevant expressions and phrases
- Ensure proper sentence structure and flow
- Choose words that resonate with Indian audience
- Maintain cultural sensitivity throughout
- Create warmth through language choices`
  };

  return languageGuides[language] || languageGuides['English'];
}