import json
import os
from openai import OpenAI

def build_prompt(category, goal, tone, language, variables):
    """
    Builds a prompt to generate WhatsApp template content using OpenAI,
    based on the category, goal, tone, language, and variables selected.
    Ensures compliance with Meta's message template guidelines and maintains correct variable order.
    """
    variable_definitions = "\n".join([f"- {{{i+1}}} → {v}" for i, v in enumerate(variables)])
    placeholder_list = ", ".join([f"{{{i+1}}}" for i in range(len(variables))])

    prompt = (
        f"You are a WhatsApp messaging expert trained in Meta's Template Guidelines.\n\n"
        f"Generate a Meta-compliant WhatsApp message body only (no footer, no buttons).\n\n"
        f"Context:\n"
        f"- Category: {category}\n"
        f"- Goal: {goal}\n"
        f"- Tone: {tone}\n"
        f"- Language: {language}\n\n"
        f"Include the following variables in numerical order using double curly braces:\n"
        f"{variable_definitions}\n\n"
        f"Rules:\n"
        f"- Use placeholders in order: {placeholder_list}\n"
        f"- Avoid overly promotional phrases like 'Buy now', 'Click here', etc.\n"
        f"- Stay under 1024 characters\n"
        f"- Avoid buttons, footers, emojis excessively, or formatting like *bold* or _italics_\n"
        f"- Do not include shortened URLs or previews\n"
        f"- Follow Meta's Business and Messaging policies strictly\n\n"
        f"Output only the message body. No explanation or formatting."
    )
    return prompt

def handler(event, context):
    # Handle CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body = json.loads(event['body'])
        
        # Initialize OpenAI client
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        # Build prompt
        prompt = build_prompt(
            category=body['category'],
            goal=body['goal'],
            tone=body['tone'],
            language=body['language'],
            variables=body['variables']
        )
        
        # Generate response
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'content': response.choices[0].message.content
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': str(e),
                'content': 'Error generating template. Please try again.'
            })
        }