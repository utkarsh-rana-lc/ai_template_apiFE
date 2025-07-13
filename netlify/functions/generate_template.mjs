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
    
    // For now, let's use a simple template system to ensure emojis work
    // We can enhance with AI later once emojis are working
    const template = generateTemplate(body.goal, body.variables, body.language, body.tone);
    
    console.log('Generated template:', template);
    
    return new Response(JSON.stringify({
      content: template,
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

function generateTemplate(goal, variables, language, tone) {
  // Simple template system with guaranteed emojis and proper formatting
  const templates = {
    'Abandoned Cart': {
      'English': {
        'Conversational': `Hi {{1}}! 👋

You left {{2}} in your cart 🛒

Complete your order now and we'll deliver by {{4}}! ✨

Don't miss out! 💫

Happy shopping! 🛍️`,
        'Persuasive': `Hi {{1}}! 👋

Your {{2}} is waiting in your cart 🛒

Complete your purchase now - limited stock available! ⚡

Get it delivered by {{4}} ✨

Shop now! 🛍️`,
        'Promotional': `Hi {{1}}! 🎉

Special reminder about {{2}} in your cart 🛒

Complete now and save! Limited time offer ⏰

Delivery by {{4}} guaranteed ✨

Don't wait! 🚀`
      }
    },
    'Order Confirmation': {
      'English': {
        'Conversational': `Hi {{1}}! 🎉

Your order is confirmed ✅

{{2}} will be delivered by {{4}} 📦

Thanks for choosing us! 💚

Excited to serve you! ✨`,
        'Informative': `Hi {{1}} 👋

Order confirmed: {{3}} ✅

Product: {{2}}
Delivery: {{4}} 📦

Thank you for your order! 🙏`,
        'Reassuring': `Hi {{1}}! 👋

Great news - your order is confirmed ✅

Your {{2}} is being prepared with care 📦

Expected delivery: {{4}} ✨

We've got you covered! 💚`
      }
    },
    'Delivery Reminder': {
      'English': {
        'Conversational': `Hi {{1}}! 📦

Your {{2}} arrives today 🚚

Please be available around {{4}} ⏰

Almost there! ✨

Have a great day! 😊`,
        'Informative': `Hi {{1}} 👋

Delivery update for order {{3}} 📦

{{2}} arriving today at {{4}} 🚚

Please be available ⏰

Thank you! 🙏`,
        'Reassuring': `Hi {{1}}! 👋

Good news - your {{2}} is out for delivery 📦

Expected time: {{4}} 🚚

We'll take good care of it! ✨

Almost in your hands! 😊`
      }
    },
    'Sale Offer': {
      'English': {
        'Promotional': `Hi {{1}}! 🎉

Special offer just for you 🎁

Get {{2}} with {{5}} discount ⚡

Limited time only! ⏰

Shop now! 🛍️`,
        'Persuasive': `Hi {{1}}! 👋

Exclusive deal on {{2}} 🎁

Save with code {{5}} - today only! ⚡

Don't miss out ✨

Grab it now! 🚀`,
        'Conversational': `Hi {{1}}! 😊

Thought you'd love this deal 🎁

{{2}} is on sale with {{5}} off ⚡

Perfect timing! ✨

Happy shopping! 🛍️`
      }
    },
    'COD Confirmation': {
      'English': {
        'Informative': `Hi {{1}} 👋

Please confirm your COD order 📋

Product: {{2}}
Order ID: {{3}}
Amount: {{5}} 💰

Reply YES to confirm ✅`,
        'Conversational': `Hi {{1}}! 👋

Quick confirmation needed 📋

Your {{2}} order ({{3}}) 
Total: {{5}} 💰

Just reply YES to confirm! ✅`,
        'Reassuring': `Hi {{1}}! 👋

Almost done with your order 📋

{{2}} - Order {{3}}
COD Amount: {{5}} 💰

Simply confirm and we'll deliver! ✅`
      }
    }
  };

  // Get template based on goal, language, and tone
  const goalTemplates = templates[goal] || templates['Abandoned Cart'];
  const langTemplates = goalTemplates[language] || goalTemplates['English'];
  const template = langTemplates[tone] || langTemplates['Conversational'] || langTemplates[Object.keys(langTemplates)[0]];

  // Ensure template is under 1024 characters
  if (template.length > 1024) {
    return template.substring(0, 1020) + '...';
  }

  return template;
}