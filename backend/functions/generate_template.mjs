import OpenAI from 'openai';
import { buildPrompt } from '../utils/prompt-builder.js';

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
    
    console.log('Request received:', body);
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    
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
    
    console.log('Generated prompt length:', prompt.length);
    
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
    console.log('OpenAI response:', content);
    
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
    
    // Return appropriate error response
    const errorMessage = error.message || 'Unknown error occurred';
    const statusCode = error.status || 500;
    
    return new Response(JSON.stringify({
      error: errorMessage,
      content: 'Error generating template. Please try again.',
      success: false
    }), {
      status: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
};