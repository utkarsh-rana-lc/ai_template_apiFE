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

  return `You are an expert WhatsApp Business API template writer with deep knowledge of Meta's messaging policies and modern e-commerce communication trends.

CONTEXT:
- Template Category: ${category}
- Use Case: ${goal}
- Communication Tone: ${tone}
- Language: ${language}
- Target: ${contextualGuidance.audience}

${contextualGuidance.context}

VARIABLES TO INCLUDE:
${variableDefinitions}

TONE & STYLE REQUIREMENTS:
${toneGuidance}

LANGUAGE REQUIREMENTS:
${languageGuidance}

EMOJI USAGE GUIDELINES:
${emojiGuidance}

COMPLIANCE RULES:
- Must comply with Meta's WhatsApp Business Policy
- No promotional language if category is "Utility" or "Authentication"
- Use variables in order: ${placeholderList}
- Maximum 1024 characters
- No URLs or call-to-action buttons in message body
- Avoid words like "Click here", "Buy now", "Limited time" for non-Marketing templates

STRUCTURE REQUIREMENTS:
- Start with personalized greeting using {{1}} (customer name)
- Include relevant business context with appropriate emojis
- Provide clear, actionable information
- End with appropriate closing based on use case
- Use emojis strategically to enhance readability and engagement

Generate ONLY the message body text. No explanations, no formatting, no additional content.`;
}

function getContextualGuidance(goal, category) {
  const contexts = {
    'Abandoned Cart': {
      audience: 'Customers who left items in their shopping cart',
      context: `PURPOSE: Gently remind customers about their abandoned cart and encourage completion.
APPROACH: Be helpful, not pushy. Focus on convenience and value.
KEY ELEMENTS: Reference specific product, mention easy completion process, create mild urgency without being aggressive.
AVOID: Aggressive sales language, multiple exclamation marks, pressure tactics.`
    },
    'Order Confirmation': {
      audience: 'Customers who just completed a purchase',
      context: `PURPOSE: Confirm order details and provide reassurance about the purchase.
APPROACH: Professional, reassuring, and informative.
KEY ELEMENTS: Order confirmation, delivery timeline, thank you message, next steps.
AVOID: Promotional content, upselling, unnecessary information.`
    },
    'Delivery Reminder': {
      audience: 'Customers expecting a delivery',
      context: `PURPOSE: Inform customers about upcoming delivery and ensure they're available.
APPROACH: Clear, informative, and helpful.
KEY ELEMENTS: Delivery timing, preparation instructions, contact information if needed.
AVOID: Marketing content, promotional offers, lengthy explanations.`
    },
    'COD Confirmation': {
      audience: 'Customers who chose Cash on Delivery payment',
      context: `PURPOSE: Confirm COD order details and get explicit confirmation.
APPROACH: Clear, direct, and professional.
KEY ELEMENTS: Order summary, amount to be paid, confirmation request, cancellation option.
AVOID: Promotional language, complex instructions, ambiguous terms.`
    },
    'Sale Offer': {
      audience: 'Existing customers or prospects interested in promotions',
      context: `PURPOSE: Inform about special offers or discounts.
APPROACH: Exciting but not overwhelming, value-focused.
KEY ELEMENTS: Clear offer details, value proposition, validity period, easy action steps.
AVOID: Excessive exclamation marks, "too good to be true" language, complex terms.`
    },
    'Custom': {
      audience: 'General customers',
      context: `PURPOSE: Provide relevant information or updates to customers.
APPROACH: Professional, clear, and customer-centric.
KEY ELEMENTS: Clear purpose, relevant information, appropriate next steps.
AVOID: Generic language, unclear messaging, irrelevant details.`
    }
  };

  return contexts[goal] || contexts['Custom'];
}

function getToneGuidance(tone) {
  const toneGuides = {
    'Conversational': `- Use natural, friendly language like talking to a friend
- Include conversational connectors ("So", "Well", "By the way")
- Keep sentences varied in length
- Use contractions (we'll, you're, it's)
- Sound warm and approachable
- Use emojis to add personality and warmth`,
    
    'Informative': `- Be clear, direct, and factual
- Use simple, easy-to-understand language
- Structure information logically
- Avoid emotional language
- Focus on providing value through information
- Use emojis to highlight key information and improve readability`,
    
    'Persuasive': `- Use compelling but not aggressive language
- Focus on benefits and value
- Include social proof elements when appropriate
- Create gentle urgency
- Appeal to customer needs and desires
- Use emojis to emphasize benefits and create emotional connection`,
    
    'Promotional': `- Highlight offers and benefits clearly
- Use exciting but professional language
- Create appropriate urgency
- Focus on value proposition
- Make the offer irresistible but believable
- Use emojis to make offers more attractive and eye-catching`,
    
    'Reassuring': `- Use calming, supportive language
- Provide clear next steps
- Address potential concerns proactively
- Sound reliable and trustworthy
- Offer assistance and support
- Use emojis to convey warmth and support`
  };

  return toneGuides[tone] || toneGuides['Informative'];
}

function getLanguageGuidance(language) {
  const languageGuides = {
    'English': `- Use clear, professional English
- Avoid complex vocabulary
- Use active voice
- Keep sentences concise
- Ensure grammar is perfect
- Use universally understood emojis`,
    
    'Hindi': `- Use simple, clear Hindi
- Avoid complex Sanskrit words
- Use familiar, everyday vocabulary
- Maintain respectful tone with appropriate honorifics
- Ensure proper Devanagari script if needed
- Use culturally appropriate emojis`,
    
    'Hinglish': `- Mix Hindi and English naturally
- Use English for technical terms (order, delivery, etc.)
- Use Hindi for emotional connection and greetings
- Keep the mix balanced and natural
- Avoid forced code-switching
- Use emojis that work well with both languages`
  };

  return languageGuides[language] || languageGuides['English'];
}

function getEmojiGuidance(goal, category) {
  const baseGuidance = `EMOJI STRATEGY:
- Use 2-4 relevant emojis per message (not excessive)
- Place emojis strategically to enhance meaning, not decorate
- Use emojis to break up text and improve readability
- Choose emojis that align with brand personality and message tone`;

  const categorySpecific = {
    'Marketing': `
MARKETING EMOJIS:
- Use exciting, positive emojis: 🎉 🎁 ✨ 💫 🔥 ⭐
- Highlight offers: 💰 💸 🏷️ 📢 🎯
- Create urgency: ⏰ ⚡ 🚀
- Show value: 💎 👑 🌟`,

    'Utility': `
UTILITY EMOJIS:
- Use informational, helpful emojis: ℹ️ ✅ 📦 🚚 📋
- Show status: ✔️ ⏳ 🔄 📍
- Indicate actions: 👆 📱 💳 🏠
- Keep professional: 📞 📧 🆔`,

    'Authentication': `
AUTHENTICATION EMOJIS:
- Use minimal, professional emojis: 🔐 ✅ 📱 🆔
- Security focused: 🛡️ 🔒 ✔️
- Avoid decorative emojis
- Keep it simple and trustworthy`
  };

  const useCaseSpecific = {
    'Abandoned Cart': `
ABANDONED CART EMOJIS:
- Shopping: 🛒 🛍️ 💳 📦
- Gentle reminders: ⏰ 💭 👀
- Positive: ✨ 💫 😊`,

    'Order Confirmation': `
ORDER CONFIRMATION EMOJIS:
- Success: ✅ 🎉 ✔️ 👍
- Shipping: 📦 🚚 📍 🏠
- Gratitude: 🙏 😊 💚`,

    'Delivery Reminder': `
DELIVERY REMINDER EMOJIS:
- Delivery: 🚚 📦 🏠 📍
- Time: ⏰ 📅 🕐
- Preparation: 🚪 📱 👀`,

    'COD Confirmation': `
COD CONFIRMATION EMOJIS:
- Money: 💰 💸 💳 💵
- Confirmation: ✅ ❓ 👍 ❌
- Professional: 📋 📞 ℹ️`,

    'Sale Offer': `
SALE OFFER EMOJIS:
- Excitement: 🎉 🎁 ✨ 🔥
- Savings: 💰 💸 🏷️ 📢
- Limited time: ⏰ ⚡ 🚀 ⏳`,

    'Custom': `
CUSTOM EMOJIS:
- Context appropriate emojis based on message content
- Professional yet engaging
- Relevant to the specific information being shared`
  };

  return `${baseGuidance}

${categorySpecific[category] || categorySpecific['Utility']}

${useCaseSpecific[goal] || useCaseSpecific['Custom']}

EMOJI PLACEMENT RULES:
- Start messages with a relevant emoji when appropriate
- Use emojis to separate different pieces of information
- End with a positive emoji when suitable
- Don't use more than 1-2 emojis per sentence
- Ensure emojis enhance, not distract from the message`;
}