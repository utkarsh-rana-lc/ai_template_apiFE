/**
 * Builds enhanced prompts for WhatsApp template generation
 * @param {string} category - Template category (Marketing, Utility, Authentication)
 * @param {string} goal - Use case (Abandoned Cart, Order Confirmation, etc.)
 * @param {string} tone - Communication tone
 * @param {string} language - Target language
 * @param {string[]} variables - Selected variables
 * @returns {string} Complete prompt for AI generation
 */
export function buildPrompt(category, goal, tone, language, variables) {
  const variableDefinitions = variables.map((v, i) => `- {{${i+1}}} → ${v}`).join('\n');
  const placeholderList = variables.map((_, i) => `{{${i+1}}}`).join(', ');

  // Enhanced context-specific prompts based on use case
  const contextualGuidance = getContextualGuidance(goal, category);
  const toneGuidance = getToneGuidance(tone);
  const languageGuidance = getLanguageGuidance(language);
  const emojiGuidance = getEmojiGuidance(goal, category);
  const formattingGuidance = getFormattingGuidance();

  return `You are an expert WhatsApp Business template writer who creates engaging, professional templates that brands love to use. You understand modern messaging trends and Meta's compliance requirements.

CONTEXT & PURPOSE:
- Template Category: ${category}
- Use Case: ${goal}
- Communication Tone: ${tone}
- Language: ${language}
- Target Audience: ${contextualGuidance.audience}

${contextualGuidance.context}

VARIABLES TO INCLUDE (use in exact order):
${variableDefinitions}

TONE & STYLE REQUIREMENTS:
${toneGuidance}

LANGUAGE REQUIREMENTS:
${languageGuidance}

EMOJI STRATEGY (CRITICAL):
${emojiGuidance}

FORMATTING REQUIREMENTS (CRITICAL):
${formattingGuidance}

COMPLIANCE RULES:
- Must comply with Meta's WhatsApp Business Policy
- No promotional language if category is "Utility" or "Authentication"
- Use variables in order: ${placeholderList}
- Maximum 1024 characters total
- No URLs or call-to-action buttons in message body
- Avoid words like "Click here", "Buy now", "Limited time" for non-Marketing templates

TEMPLATE STRUCTURE (MANDATORY):
1. GREETING: Start with emoji + personalized greeting using {{1}}
2. CONTEXT: 1-2 lines explaining the situation with relevant emojis
3. MAIN MESSAGE: Core information with strategic emoji placement
4. ACTION/NEXT STEPS: Clear next steps (if applicable)
5. CLOSING: Positive closing with appropriate emoji

CRITICAL: Generate ONLY the message body text with proper line breaks and strategic emoji usage. No explanations, no formatting markers, no additional content.`;
}

EXAMPLE OUTPUT FORMAT (MANDATORY):
Hi {{1}}! 👋

[Context line with emoji] 📦

[Main message line 1]
[Main message line 2] ✨

[Action/next steps] 🚀

[Closing with emoji] 🙏

YOU MUST follow this exact structure with line breaks and emojis.`;
}

function getFormattingGuidance() {
  return \`FORMATTING RULES (MUST FOLLOW):
- Use \\n\\n for paragraph breaks (double line breaks)
- Use \\n for single line breaks within sections
- Start each major section on a new line
- Keep sentences concise (max 15-20 words each)
- Use emojis to create visual breaks between information
- Structure: Greeting → Context → Main Message → Action → Closing
- Each section should be visually distinct with proper spacing

EXAMPLE STRUCTURE:
Hi {{1}}! 👋

[Context line with emoji] 📦

[Main message line 1]
[Main message line 2] ✨

[Action/next steps] 🚀

[Closing with emoji] 🙏`;
}

function getContextualGuidance(goal, category) {
  const contexts = {
    'Abandoned Cart': {
      audience: 'Customers who left items in their shopping cart',
      context: \`PURPOSE: Gently remind customers about their abandoned cart and encourage completion.
APPROACH: Friendly reminder with urgency but not pushy. Focus on convenience and value.
KEY ELEMENTS: Reference specific product, mention easy completion, create mild urgency.
STRUCTURE: Greeting → Cart reminder → Product highlight → Easy completion → Closing
AVOID: Aggressive sales language, multiple exclamation marks, pressure tactics.`
    },
    'Order Confirmation': {
      audience: 'Customers who just completed a purchase',
      context: \`PURPOSE: Confirm order details and provide reassurance about the purchase.
APPROACH: Professional, reassuring, and celebratory.
KEY ELEMENTS: Order confirmation, delivery timeline, gratitude, next steps.
STRUCTURE: Greeting → Confirmation celebration → Order details → Timeline → Thank you
AVOID: Promotional content, upselling, unnecessary information.`
    },
    'Delivery Reminder': {
      audience: 'Customers expecting a delivery',
      context: \`PURPOSE: Inform customers about upcoming delivery and ensure availability.
APPROACH: Clear, helpful, and informative.
KEY ELEMENTS: Delivery timing, preparation instructions, contact info if needed.
STRUCTURE: Greeting → Delivery notification → Timing details → Preparation → Support
AVOID: Marketing content, promotional offers, lengthy explanations.`
    },
    'COD Confirmation': {
      audience: 'Customers who chose Cash on Delivery payment',
      context: \`PURPOSE: Confirm COD order details and get explicit confirmation.
APPROACH: Clear, direct, and professional with easy response options.
KEY ELEMENTS: Order summary, amount breakdown, confirmation request, cancellation option.
STRUCTURE: Greeting → Order summary → Amount details → Confirmation request → Instructions
AVOID: Promotional language, complex instructions, ambiguous terms.`
    },
    'Sale Offer': {
      audience: 'Existing customers or prospects interested in promotions',
      context: \`PURPOSE: Inform about special offers and create excitement.
APPROACH: Exciting but professional, value-focused with clear benefits.
KEY ELEMENTS: Offer highlight, value proposition, validity period, easy action.
STRUCTURE: Greeting → Offer announcement → Value highlight → Validity → Action
AVOID: Excessive exclamation marks, "too good to be true\" language, complex terms.`
    },
    'Custom': {
      audience: 'General customers',
      context: \`PURPOSE: Provide relevant information or updates to customers.
APPROACH: Professional, clear, and customer-centric.
KEY ELEMENTS: Clear purpose, relevant information, appropriate next steps.
STRUCTURE: Greeting → Purpose → Information → Next steps → Closing
AVOID: Generic language, unclear messaging, irrelevant details.`
    }
  };

  return contexts[goal] || contexts['Custom'];
}

function getToneGuidance(tone) {
  const toneGuides = {
    'Conversational': \`CONVERSATIONAL TONE REQUIREMENTS:
- Use natural, friendly language like talking to a friend
- Include conversational connectors ("So", "Well", "By the way")
- Keep sentences varied in length and natural flow
- Use contractions (we'll, you\'re, it's, don\'t)
- Sound warm and approachable with personal touch
- Use emojis to add personality and warmth (3-4 per message)
- Example phrases: "Hey there!", "Just wanted to let you know", "Hope you're doing well"`,
    
    'Informative': \`INFORMATIVE TONE REQUIREMENTS:
- Be clear, direct, and factual with structured information
- Use simple, easy-to-understand language
- Structure information logically with clear sections
- Avoid emotional language, focus on facts
- Provide value through clear, actionable information
- Use emojis to highlight key information and improve readability (2-3 per message)
- Example phrases: "Here's what you need to know", "Important update", "Details below"`,
    
    'Persuasive': \`PERSUASIVE TONE REQUIREMENTS:
- Use compelling but not aggressive language
- Focus on benefits and value proposition clearly
- Include subtle urgency and appeal to needs
- Create desire while maintaining professionalism
- Appeal to customer needs and desires effectively
- Use emojis to emphasize benefits and create emotional connection (3-4 per message)
- Example phrases: "Don't miss out", "Perfect for you", "Limited opportunity"`,
    
    'Promotional': \`PROMOTIONAL TONE REQUIREMENTS:
- Highlight offers and benefits with excitement
- Use exciting but professional language
- Create appropriate urgency without being pushy
- Focus on value proposition and savings
- Make offers irresistible but believable
- Use emojis to make offers attractive and eye-catching (4-5 per message)
- Example phrases: "Special offer!", "Exclusive deal", "Save big", "Limited time"`,
    
    'Reassuring': \`REASSURING TONE REQUIREMENTS:
- Use calming, supportive language that builds confidence
- Provide clear next steps and guidance
- Address potential concerns proactively
- Sound reliable, trustworthy, and helpful
- Offer assistance and support clearly
- Use emojis to convey warmth, support, and reliability (2-3 per message)
- Example phrases: "We've got you covered", "Everything is on track", "We're here to help"`
  };

  return toneGuides[tone] || toneGuides['Informative'];
}

function getLanguageGuidance(language) {
  const languageGuides = {
    'English': \`ENGLISH LANGUAGE REQUIREMENTS:
- Use clear, professional English with modern business communication style
- Avoid overly complex vocabulary, keep it accessible
- Use active voice and direct communication
- Keep sentences concise but complete (10-15 words ideal)
- Ensure perfect grammar and professional presentation
- Use universally understood emojis that work globally
- Maintain consistent tone throughout the message`,
    
    'Hindi': \`HINDI LANGUAGE REQUIREMENTS:
- Use simple, clear Hindi with everyday vocabulary
- Avoid complex Sanskrit words, use familiar terms
- Use appropriate honorifics (आप, जी) for respectful tone
- Maintain cultural sensitivity and appropriate formality
- Ensure proper sentence structure and grammar
- Use culturally appropriate emojis that resonate with Indian audience
- Mix formal and friendly elements appropriately`,
    
    'Hinglish': \`HINGLISH LANGUAGE REQUIREMENTS:
- Mix Hindi and English naturally and authentically
- Use English for technical/business terms (order, delivery, payment)
- Use Hindi for emotional connection and greetings (नमस्ते, धन्यवाद)
- Keep the mix balanced and natural, avoid forced switching
- Maintain readability for both Hindi and English speakers
- Use emojis that work well with both languages
- Ensure the flow feels natural and conversational`
  };

  return languageGuides[language] || languageGuides['English'];
}

function getEmojiGuidance(goal, category) {
  const baseGuidance = \`EMOJI STRATEGY (CRITICAL FOR BRAND APPEAL):
- Use 3-5 relevant emojis per message (brands love visual appeal)
- Place emojis strategically to enhance meaning and create visual breaks
- Use emojis to separate different pieces of information
- Choose emojis that align with brand personality and message tone
- NEVER use emojis just for decoration - each must serve a purpose`;

  const categorySpecific = {
    'Marketing': `
MARKETING EMOJI REQUIREMENTS:
- Use exciting, positive emojis: 🎉 🎁 ✨ 💫 🔥 ⭐ 🌟 💎
- Highlight offers and savings: 💰 💸 🏷️ 📢 🎯 💳 🛍️
- Create urgency and excitement: ⏰ ⚡ 🚀 ⏳ 🔔 📣
- Show value and premium feel: 💎 👑 🌟 ✨ 🏆 💫
- Use celebration emojis: 🎉 🥳 🎊 🎈 🍾`,

    'Utility': `
UTILITY EMOJI REQUIREMENTS:
- Use informational, helpful emojis: ℹ️ ✅ 📦 🚚 📋 📍 📞
- Show status and progress: ✔️ ⏳ 🔄 📍 🕐 📅
- Indicate actions needed: 👆 📱 💳 🏠 📧 📞
- Keep professional but friendly: 📞 📧 🆔 ℹ️ 📋 ✅
- Use confirmation emojis: ✅ ✔️ 👍 ☑️`,

    'Authentication': `
AUTHENTICATION EMOJI REQUIREMENTS:
- Use minimal, professional emojis: 🔐 ✅ 📱 🆔 🔒
- Security and trust focused: 🛡️ 🔒 ✔️ 🔐 🆔
- Avoid decorative emojis, keep it simple
- Maximum 2-3 emojis total for professional feel
- Focus on security and verification: 🔐 ✅ 📱`
  };

  const useCaseSpecific = {
    'Abandoned Cart': `
ABANDONED CART EMOJI STRATEGY:
- Shopping context: 🛒 🛍️ 💳 📦 🎁 💝
- Gentle reminders: ⏰ 💭 👀 🔔 📱
- Positive encouragement: ✨ 💫 😊 🌟 💖
- Value emphasis: 💰 💸 🏷️ 💎
EXAMPLE PLACEMENT: "Hi {{1}}! 👋\\n\\nYou left {{2}} in your cart 🛒\\n\\nComplete your purchase now and save! ✨"`,

    'Order Confirmation': `
ORDER CONFIRMATION EMOJI STRATEGY:
- Success and celebration: ✅ 🎉 ✔️ 👍 🥳 🎊
- Shipping and delivery: 📦 🚚 📍 🏠 🚛 📬
- Gratitude and appreciation: 🙏 😊 💚 ❤️ 🤝
- Timeline and process: 📅 ⏰ 🕐 📋
EXAMPLE PLACEMENT: "Hi {{1}}! 🎉\\n\\nYour order is confirmed ✅\\n\\nWe'll deliver by {{3}} 📦🚚"`,

    'Delivery Reminder': `
DELIVERY REMINDER EMOJI STRATEGY:
- Delivery and logistics: 🚚 📦 🏠 📍 🚛 📬
- Time and scheduling: ⏰ 📅 🕐 ⏳ 🔔
- Preparation and readiness: 🚪 📱 👀 🏠 📞
- Professional service: 📞 📧 ℹ️ 👨‍💼
EXAMPLE PLACEMENT: "Hi {{1}}! 📦\\n\\nYour order arrives today 🚚\\n\\nPlease be available at {{3}} ⏰"`,

    'COD Confirmation': `
COD CONFIRMATION EMOJI STRATEGY:
- Money and payment: 💰 💸 💳 💵 💴 🏦
- Confirmation and choice: ✅ ❓ 👍 ❌ ☑️ 📝
- Professional and clear: 📋 📞 ℹ️ 📧 📱
- Order details: 📦 🛍️ 📋 🆔
EXAMPLE PLACEMENT: "Hi {{1}}! 📋\\n\\nCOD Order: {{3}} 💰\\n\\nAmount: ₹{{4}} 💸\\n\\nConfirm? ✅❌"`,

    'Sale Offer': `
SALE OFFER EMOJI STRATEGY:
- Excitement and celebration: 🎉 🎁 ✨ 🔥 🥳 🎊
- Savings and value: 💰 💸 🏷️ 📢 💎 🌟
- Limited time urgency: ⏰ ⚡ 🚀 ⏳ 🔔 📣
- Shopping and products: 🛍️ 🛒 💳 🎁 💝
EXAMPLE PLACEMENT: "Hi {{1}}! 🎉\\n\\nSpecial offer just for you! 🎁\\n\\nSave {{3}} on {{2}} 💰\\n\\nLimited time! ⏰"`,

    'Custom': `
CUSTOM EMOJI STRATEGY:
- Context appropriate emojis based on message content
- Professional yet engaging approach
- Relevant to the specific information being shared
- 2-4 emojis strategically placed
- Focus on clarity and brand appeal`
  };

  return \`${baseGuidance}

${categorySpecific[category] || categorySpecific['Utility']}

${useCaseSpecific[goal] || useCaseSpecific['Custom']}

EMOJI PLACEMENT RULES (MANDATORY):
1. START: Begin with relevant emoji after greeting
2. SECTIONS: Use emojis to separate different information blocks
3. EMPHASIS: Place emojis after key information points
4. CLOSING: End with positive, appropriate emoji
5. SPACING: Ensure emojis don't clutter the text
6. CONTEXT: Each emoji must relate to the content around it

FORMATTING WITH EMOJIS:
- Line 1: Greeting + emoji
- Line 2: Context + relevant emoji  
- Line 3-4: Main message with strategic emoji placement
- Final line: Closing + positive emoji`;
}