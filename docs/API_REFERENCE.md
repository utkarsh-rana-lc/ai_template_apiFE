# API Reference

Complete API documentation for the WhatsApp Template AI Generator.

## 📡 **Base URL**

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## 🔐 **Authentication**

The API uses server-side OpenAI API key authentication. No client-side authentication is required.

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 📋 **Endpoints**

### **POST /generate_template**

Generates a WhatsApp Business template using AI based on provided parameters.

#### **Request**

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| `category` | string | Yes | Template category as per Meta guidelines | `Marketing`, `Utility`, `Authentication` |
| `goal` | string | Yes | Primary use case for the template | `Abandoned Cart`, `Order Confirmation`, `Delivery Reminder`, `COD Confirmation`, `Sale Offer`, `Custom` |
| `tone` | string | Yes | Communication tone for the message | `Conversational`, `Informative`, `Persuasive`, `Promotional`, `Reassuring` |
| `language` | string | Yes | Target language for the template | `English`, `Hindi`, `Hinglish` |
| `variables` | array | No | List of variables to include in template | Array of strings (max 10 items) |

**Example Request:**
```json
{
  "category": "Marketing",
  "goal": "Abandoned Cart",
  "tone": "Conversational",
  "language": "English",
  "variables": ["Customer Name", "Product Name", "Order ID", "Delivery Date"]
}
```

#### **Response**

**Success Response (200):**
```json
{
  "content": "Hi {{1}}, you left {{2}} in your cart! 🛒\n\nComplete your purchase now and get it delivered by {{4}}. Don't miss out! ✨\n\nOrder ID: {{3}}",
  "success": true
}
```

**Error Response (400 - Bad Request):**
```json
{
  "error": "Missing required fields",
  "content": "Please fill in all required fields.",
  "success": false
}
```

**Error Response (500 - Internal Server Error):**
```json
{
  "error": "OpenAI API error: Rate limit exceeded",
  "content": "Error generating template. Please try again.",
  "success": false
}
```

## 📊 **Response Format**

All API responses follow a consistent format:

```typescript
interface APIResponse {
  content: string;      // Generated template content or error message
  success: boolean;     // Indicates if the request was successful
  error?: string;       // Error message (only present on failure)
}
```

## 🔧 **Request Validation**

### **Category Validation**
- **Marketing**: For promotional content, offers, sales
- **Utility**: For transactional messages, confirmations, updates
- **Authentication**: For OTP, verification messages

### **Goal Validation**
- **Abandoned Cart**: Remind customers about items left in cart
- **Order Confirmation**: Confirm successful order placement
- **Delivery Reminder**: Notify about upcoming deliveries
- **COD Confirmation**: Confirm cash-on-delivery orders
- **Sale Offer**: Promote special offers and discounts
- **Custom**: General purpose templates

### **Tone Validation**
- **Conversational**: Friendly, casual communication
- **Informative**: Clear, factual information delivery
- **Persuasive**: Compelling but not aggressive
- **Promotional**: Exciting, offer-focused
- **Reassuring**: Calming, supportive messaging

### **Language Validation**
- **English**: Standard English communication
- **Hindi**: Hindi language with appropriate honorifics
- **Hinglish**: Natural mix of Hindi and English

### **Variables Validation**
- Maximum 10 variables per request
- Common variables: `Customer Name`, `Product Name`, `Order ID`, `Delivery Date`, `Discount Code`
- Variables are automatically mapped to `{{1}}`, `{{2}}`, etc. in order

## 🚨 **Error Codes**

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Missing or invalid request parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 429 | Rate Limited | Too many requests (see rate limiting) |
| 500 | Internal Server Error | Server error or OpenAI API issues |
| 503 | Service Unavailable | Temporary service outage |

## ⚡ **Rate Limiting**

To prevent abuse and ensure fair usage:

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 **Template Variables**

Variables are automatically numbered in the order they appear in the request:

```json
{
  "variables": ["Customer Name", "Product Name", "Order ID"]
}
```

Results in:
- `{{1}}` → Customer Name
- `{{2}}` → Product Name  
- `{{3}}` → Order ID

### **Available Variables**

| Variable | Description | Example Usage |
|----------|-------------|---------------|
| Customer Name | Recipient's name | Hi {{1}}, ... |
| Product Name | Product or service name | Your {{2}} is ready |
| Order ID | Unique order identifier | Order {{3}} confirmed |
| Delivery Date | Expected delivery date | Delivery by {{4}} |
| Discount Code | Promotional code | Use code {{5}} |
| Store Name | Business/store name | Visit {{6}} store |
| Support Number | Customer support contact | Call {{7}} for help |
| Amount | Price or total amount | Pay ₹{{8}} |
| Tracking ID | Shipment tracking number | Track with {{9}} |
| Expiry Date | Offer expiration date | Valid till {{10}} |

## 🎯 **Use Case Examples**

### **Abandoned Cart Template**

**Request:**
```json
{
  "category": "Marketing",
  "goal": "Abandoned Cart",
  "tone": "Conversational",
  "language": "English",
  "variables": ["Customer Name", "Product Name", "Discount Code"]
}
```

**Response:**
```json
{
  "content": "Hi {{1}}! 👋\n\nYou left {{2}} in your cart. Complete your purchase now and get 10% off with code {{3}}! 🛒✨\n\nDon't miss out on this amazing deal!",
  "success": true
}
```

### **Order Confirmation Template**

**Request:**
```json
{
  "category": "Utility",
  "goal": "Order Confirmation",
  "tone": "Informative",
  "language": "English",
  "variables": ["Customer Name", "Order ID", "Delivery Date"]
}
```

**Response:**
```json
{
  "content": "Hi {{1}}, ✅\n\nYour order {{2}} has been confirmed! We'll deliver it by {{3}}.\n\nThank you for choosing us! 📦",
  "success": true
}
```

### **Hindi Language Template**

**Request:**
```json
{
  "category": "Utility",
  "goal": "Delivery Reminder",
  "tone": "Informative",
  "language": "Hindi",
  "variables": ["Customer Name", "Order ID"]
}
```

**Response:**
```json
{
  "content": "नमस्ते {{1}} जी! 🙏\n\nआपका ऑर्डर {{2}} आज डिलीवर होगा। कृपया घर पर उपलब्ध रहें। 📦\n\nधन्यवाद!",
  "success": true
}
```

## 🔍 **Testing the API**

### **cURL Example**

```bash
curl -X POST https://your-domain.com/api/generate_template \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Marketing",
    "goal": "Sale Offer",
    "tone": "Promotional",
    "language": "English",
    "variables": ["Customer Name", "Discount Code"]
  }'
```

### **JavaScript/Fetch Example**

```javascript
const response = await fetch('/api/generate_template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category: 'Marketing',
    goal: 'Sale Offer',
    tone: 'Promotional',
    language: 'English',
    variables: ['Customer Name', 'Discount Code']
  })
});

const data = await response.json();
console.log(data.content);
```

### **Python Example**

```python
import requests

url = "https://your-domain.com/api/generate_template"
payload = {
    "category": "Marketing",
    "goal": "Sale Offer",
    "tone": "Promotional",
    "language": "English",
    "variables": ["Customer Name", "Discount Code"]
}

response = requests.post(url, json=payload)
data = response.json()
print(data["content"])
```

## 🛡️ **Security Considerations**

### **Input Sanitization**
- All inputs are validated and sanitized
- Maximum length limits enforced
- Special characters are handled safely

### **Rate Limiting**
- IP-based rate limiting prevents abuse
- Exponential backoff recommended for retries

### **API Key Security**
- Never expose OpenAI API key in client-side code
- Use environment variables for key storage
- Rotate keys regularly

## 📊 **Performance**

### **Response Times**
- Average: 2-4 seconds
- Maximum: 10 seconds (with timeout)
- Factors: OpenAI API latency, prompt complexity

### **Optimization Tips**
- Cache responses for identical requests
- Implement request deduplication
- Use connection pooling for high traffic

## 🔄 **Versioning**

Current API version: **v1**

Future versions will be backward compatible or provide migration paths.

**Version Header:**
```
API-Version: v1
```

## 📞 **Support**

For API support:
- 📖 Check this documentation
- 🐛 Report issues in the repository
- 📧 Contact technical support
- 💬 Join the developer community

## 🧪 **Webhook Support (Future)**

Planned webhook support for:
- Template generation completion
- Error notifications
- Usage analytics

**Webhook Payload Example:**
```json
{
  "event": "template.generated",
  "data": {
    "request_id": "req_123456",
    "content": "Generated template...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

This API reference provides complete information for integrating with the WhatsApp Template AI Generator API. For additional examples and integration guides, see the other documentation files.