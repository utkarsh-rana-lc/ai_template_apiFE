import OpenAI from 'openai';

function buildPrompt(category, goal, tone, language, variables) {
  const variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
  const placeholderList = variables.map((_, i) => `{{${i+1}}}`).join(', ');

  return `You are a WhatsApp messaging expert trained in Meta's Template Guidelines.

Generate a Meta-compliant WhatsApp message body only (no footer, no buttons).

Context:
- Category: ${category}
- Goal: ${goal}
- Tone: ${tone}
- Language: ${language}

Include the following variables in numerical order using double curly braces:
${variableDefinitions}

Rules:
- Use placeholders in order: ${placeholderList}
- Avoid overly promotional phrases like 'Buy now', 'Click here', etc.
- Stay under 1024 characters
- Avoid buttons, footers, emojis excessively, or formatting like *bold* or _italics_
- Do not include shortened URLs or previews
- Follow Meta's Business and Messaging policies strictly

Output only the message body. No explanation or formatting.`;
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
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Build prompt
    const prompt = buildPrompt(
      body.category,
      body.goal,
      body.tone,
      body.language,
      body.variables
    );
    
    // Generate response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    
    return new Response(JSON.stringify({
      content: response.choices[0].message.content
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
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