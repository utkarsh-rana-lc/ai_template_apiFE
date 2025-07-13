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
    
    // Build enhanced prompt
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables || []
    );
    
    // Generate response with optimized parameters
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ 
        role: "system", 
        content: "You are an expert WhatsApp Business template writer who creates engaging, emoji-rich content that brands love. Generate only the message body content with strategic emoji usage that complies with Meta's guidelines." 
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
  const variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
  const placeholderList = variables.map((_, i) => `{{${i+1}}}`).join(', ');

  const prompt = `You are a WhatsApp Business template expert. Create a ${tone.toLowerCase()} ${language} template for ${goal}.

Template Category: ${category}
Use Case: ${goal}
Tone: ${tone}
Language: ${language}

Variables to include in order:
${variableDefinitions}

CRITICAL REQUIREMENTS:
1. Include 3-5 relevant emojis strategically placed throughout
2. Use proper line breaks (\\n\\n for paragraphs, \\n for single breaks)
3. Keep under 1024 characters total
4. Sound natural and ${tone.toLowerCase()}, not robotic
5. Use variables in exact order: ${placeholderList}
6. Comply with Meta's WhatsApp Business policies
7. Make it engaging and brand-friendly

Structure your response with:
- Personalized greeting with emoji
- Clear context/situation
- Main message with key information
- Call to action or next steps
- Positive closing with emoji

Generate ONLY the message body content. No explanations or formatting markers.`;

  return prompt;
}