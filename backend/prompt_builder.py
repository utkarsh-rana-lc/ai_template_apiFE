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