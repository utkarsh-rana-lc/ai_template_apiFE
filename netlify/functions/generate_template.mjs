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
    
    console.log('Request received:', body);
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    
    // Validate required fields
    if (!body.category || !body.goal || !body.tone || !body.language) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        content: 'Please fill in all required fields.',
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
    
    // Build the prompt
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables || []
    );
    
    console.log('Generated prompt:', prompt);
    
    // Generate response with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert WhatsApp Business template writer. You MUST include exactly 4-5 emojis in every message. You MUST use proper line breaks (\\n\\n for paragraphs). You MUST keep messages under 1000 characters. Write naturally and conversationally, not robotically."
        },
        {
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    
    let content = response.choices[0].message.content.trim();
    console.log('Raw AI response:', content);
    
    // Ensure content is under 1024 characters for WhatsApp
    if (content.length > 1024) {
      content = content.substring(0, 1020) + '...';
    }
    
    console.log('Final content:', content);
    console.log('Content length:', content.length);
    
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

function buildPrompt(category, goal, tone, language, variables) {
  const variableDefinitions = variables.map((v, i) => `{{${i+1}}} = ${v}`).join('\n');
  
  return `Create a WhatsApp Business template for:
- Category: ${category}
- Use Case: ${goal}
- Tone: ${tone}
- Language: ${language}

Variables to use:
${variableDefinitions}

CRITICAL REQUIREMENTS:
1. MUST include exactly 4-5 emojis throughout the message
2. MUST use \\n\\n for paragraph breaks (double line breaks)
3. MUST be under 1000 characters total
4. MUST sound natural and conversational, NOT robotic
5. MUST use the variables in order: ${variables.map((_, i) => `{{${i+1}}}`).join(', ')}

Structure:
- Line 1: Greeting with emoji
- Line 2: Empty line (\\n\\n)
- Line 3: Context with emoji
- Line 4: Empty line (\\n\\n)
- Line 5: Main message with emoji
- Line 6: Empty line (\\n\\n)
- Line 7: Closing with emoji

Example format:
Hi {{1}}! 👋

You left {{2}} in your cart! 🛒

Complete your purchase now and get it delivered by {{3}}! ✨

Don't miss out! 💫

Generate ONLY the message content with proper emojis and line breaks. No explanations.`;
}