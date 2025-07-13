import OpenAI from 'openai';

function buildPrompt(category, goal, tone, language, variables) {
  const variableDefinitions = variables.map((v, i) => `{{${i+1}}} = ${v}`).join(', ');
  
  // Get specific examples for the use case
  const examples = getExamplesForUseCase(goal, variables);
  const emojiRequirements = getEmojiRequirements(goal);
  
  return `You are a creative WhatsApp marketing expert who writes engaging, emoji-rich messages that customers love to receive.

TASK: Write a ${goal} message in ${language} with a ${tone} tone.

VARIABLES: ${variableDefinitions}

${emojiRequirements}

WRITING STYLE RULES:
- Write like a friendly human, NOT a robot
- Use natural, conversational language
- Include contractions (we'll, you're, don't, it's)
- Vary sentence length for natural flow
- Sound excited and genuine
- Make it feel personal and warm

MANDATORY STRUCTURE:
Line 1: Friendly greeting with emoji
Line 2: [BLANK LINE]
Line 3: Context/situation with emoji
Line 4: [BLANK LINE] 
Line 5: Main message with emoji
Line 6: Call to action with emoji
Line 7: [BLANK LINE]
Line 8: Warm closing with emoji

EXAMPLE FORMAT:
Hi {{1}}! 👋

You left something special in your cart! 🛒

Your {{2}} is waiting for you and we'd love to get it delivered by {{3}}! ✨

Don't let this amazing deal slip away! 💫

Happy shopping! 🛍️

Write ONLY the message body with this exact structure and emoji placement.`;
}

function getExamplesForUseCase(goal, variables) {
  const examples = {
    'Abandoned Cart': `EXAMPLE OUTPUT:
Hi {{1}}! 👋

You left {{2}} in your cart! 🛒

We're holding it for you and can deliver by {{3}} if you complete your order today! ✨

Don't miss out on this great find! 💫

Happy shopping! 🛍️`,

    'Order Confirmation': `EXAMPLE OUTPUT:
Hi {{1}}! 🎉

Your order is confirmed! ✅

We're preparing your {{2}} and it'll be delivered by {{3}}! 📦

Thank you for choosing us! 💚

We can't wait for you to love it! ✨`,

    'Delivery Reminder': `EXAMPLE OUTPUT:
Hi {{1}}! 📦

Your {{2}} is coming today! 🚚

Please be available around {{3}} for delivery! ⏰

We're excited to get this to you! ✨

Have a wonderful day! 😊`,

    'Sale Offer': `EXAMPLE OUTPUT:
Hi {{1}}! 🎉

Special offer just for you! 🎁

Get {{2}} with {{3}} discount - but hurry, it's limited time! ⏰

Don't miss this amazing deal! 💫

Happy shopping! 🛍️`
  };

  return examples[goal] || examples['Abandoned Cart'];
}

function getEmojiRequirements(goal) {
  return `EMOJI REQUIREMENTS (MANDATORY):
- Use EXACTLY 5 emojis in the message
- Place one emoji at the end of lines 1, 3, 5, 6, and 8
- Choose emojis that match the context and emotion
- Make emojis feel natural, not forced
- Use these types: greeting (👋), context-specific, excitement (✨💫), action, closing

EMOJI EXAMPLES FOR ${goal}:
👋 🛒 ✨ 💫 🛍️ (shopping)
👋 ✅ 📦 💚 ✨ (confirmation)  
👋 📦 🚚 ⏰ 😊 (delivery)
👋 🎉 🎁 ⏰ 🛍️ (offers)`;
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
    const body = await request.json();
    
    console.log('Request received:', body);
    
    // Validate required fields
    if (!body.category || !body.goal || !body.tone || !body.language) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        content: 'Please fill in all required fields.'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables || []
    );
    
    console.log('Generated prompt:', prompt);
    
    // Use more creative parameters for natural output
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ 
        role: "system", 
        content: `You are a creative WhatsApp message writer who ALWAYS includes emojis and writes in a natural, human way.

CRITICAL RULES:
1. ALWAYS use exactly 5 emojis in every message
2. Write like a real person, not a robot
3. Use natural language with contractions
4. Follow the exact line structure provided
5. Make it warm and engaging

If you don't include emojis, the message will be rejected.`
      }, {
        role: "user", 
        content: prompt 
      }],
      max_tokens: 200,
      temperature: 0.9,  // Higher creativity
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });
    
    let content = response.choices[0].message.content.trim();
    
    // Post-process to ensure emojis are present
    if (!containsEmojis(content)) {
      console.log('No emojis detected, adding fallback emojis');
      content = addFallbackEmojis(content, body.goal);
    }
    
    console.log('Final content:', content);
    
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
    console.error('Function error:', error);
    
    // Fallback with emojis
    const fallbackContent = generateFallbackContent(body?.goal || 'Custom', body?.variables || []);
    
    return new Response(JSON.stringify({
      content: fallbackContent,
      success: true,
      note: 'Using fallback content due to API error'
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
};

function containsEmojis(text) {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

function addFallbackEmojis(content, goal) {
  const lines = content.split('\n');
  const emojiSets = {
    'Abandoned Cart': ['👋', '🛒', '✨', '💫', '🛍️'],
    'Order Confirmation': ['👋', '✅', '📦', '💚', '✨'],
    'Delivery Reminder': ['👋', '📦', '🚚', '⏰', '😊'],
    'Sale Offer': ['👋', '🎉', '🎁', '⏰', '🛍️'],
    'COD Confirmation': ['👋', '📋', '💰', '✅', '🙏'],
    'Custom': ['👋', '📱', '✨', '💫', '😊']
  };
  
  const emojis = emojiSets[goal] || emojiSets['Custom'];
  let emojiIndex = 0;
  
  return lines.map(line => {
    if (line.trim() && !containsEmojis(line) && emojiIndex < emojis.length) {
      return line + ' ' + emojis[emojiIndex++];
    }
    return line;
  }).join('\n');
}

function generateFallbackContent(goal, variables) {
  const templates = {
    'Abandoned Cart': `Hi {{1}}! 👋

You left {{2}} in your cart! 🛒

Complete your purchase now and get it delivered by {{4}}! ✨

Don't miss out on this amazing deal! 💫

Happy shopping! 🛍️`,

    'Order Confirmation': `Hi {{1}}! 🎉

Your order is confirmed! ✅

We're preparing your {{2}} and it'll be delivered by {{4}}! 📦

Thank you for choosing us! 💚

We can't wait for you to love it! ✨`,

    'Delivery Reminder': `Hi {{1}}! 📦

Your {{2}} is arriving today! 🚚

Please be available around {{4}} for delivery! ⏰

We're excited to get this to you! ✨

Have a wonderful day! 😊`,

    'Sale Offer': `Hi {{1}}! 🎉

Special offer just for you! 🎁

Get amazing deals on {{2}} - limited time only! ⏰

Don't miss this incredible opportunity! 💫

Happy shopping! 🛍️`,

    'COD Confirmation': `Hi {{1}}! 👋

Please confirm your COD order! 📋

Order: {{3}} | Amount: {{5}} 💰

Reply YES to confirm or NO to cancel! ✅

Thank you for your business! 🙏`
  };

  return templates[goal] || templates['Abandoned Cart'];
}