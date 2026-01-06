const API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
const API_BASE = import.meta.env.VITE_CEREBRAS_API_BASE || "https://api.cerebras.ai/v1";
const MODEL = import.meta.env.VITE_MODEL_NAME || "gpt-oss-120b";

// Helper to calculate stars from score if fallback is needed
function calculateStars(score) {
    if (score >= 2.5) return 5;
    if (score >= 1) return 4;
    if (score >= -0.5) return 3;
    if (score >= -3) return 2;
    return 1;
}

export const analyzeReview = async (text, userRating) => {
    // 1. Validate Configuration
    if (!API_KEY) {
        console.error("Missing VITE_CEREBRAS_API_KEY in .env");
        return {
            stars: userRating,
            sentiment: 'neutral',
            explanation: "Configuration Error: API Key missing. Please ensure VITE_CEREBRAS_API_KEY is allowed in .env",
            ai_response: "System Error: Unable to contact AI service.",
            ai_summary: "Error: No API Key",
            ai_action: "Action: Check system configuration.",
            dimensions: {}
        };
    }

    // 2. Construct System Prompt
    const systemPrompt = `
You are an expert Restaurant Manager and CX Analyst.
Your task is to analyze customer reviews and output valid JSON only.

INPUT DATA:
- Star Rating (1-5)
- Review Text (Optional)

OUTPUT SCHEMA:
{
  "sentiment": "positive" | "negative" | "neutral",
  "explanation": "Brief reasoning for the sentiment",
  "ai_response": "A polite, human-like reply from the Owner. Adapt tone to the rating.",
  "ai_summary": "Concise 5-word summary for the dashboard.",
  "ai_action": "Action: [Specific Action] (e.g., 'Action: Contact Customer', 'Action: Thank Staff', 'Action: None')",
  "dimensions": {
    "food": "Detected (positive/negative)" | "Not mentioned",
    "service": "Detected (positive/negative)" | "Not mentioned",
    "ambiance": "Detected (positive/negative)" | "Not mentioned",
    "value": "Detected (positive/negative)" | "Not mentioned"
  }
}

RULES:
1. Trust the Star Rating:
   - 4-5 Stars = Sentiment MUST be "positive". Response MUST be grateful.
   - 1-2 Stars = Sentiment MUST be "negative". Response MUST be apologetic.
   - 3 Stars = Neutral/Mixed.
2. If text is empty, generate a generic response based ONLY on the stars.
3. Output RAW JSON only. No markdown formatting.
`;

    // 3. Construct User Message
    const userMessage = `Rating: ${userRating} Stars\nReview: "${text || "(No text provided)"}"`;

    // Construct Base URL safely (remove trailing slashes or duplicate paths)
    const normalizedBase = API_BASE.replace(/\/chat\/completions\/?$/, "").replace(/\/+$/, "");

    try {
        const response = await fetch(`${normalizedBase}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.2, // Low temp for consistent JSON
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Cerebras API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiContent = data.choices[0].message.content;

        // 4. Parse JSON Response
        const result = JSON.parse(aiContent);

        // 5. Return Formatted Data
        return {
            stars: userRating, // Keep original user rating
            predicted_stars: userRating, // Assume AI agrees with user for now
            sentiment: result.sentiment,
            explanation: result.explanation,
            ai_response: result.ai_response,
            ai_summary: result.ai_summary,
            ai_action: result.ai_action,
            dimensions: result.dimensions || {},
            confidence: 1.0
        };

    } catch (error) {
        console.error("AI Analysis Failed:", error);

        // Fallback Logic:
        // 1. Admin gets the truth ("AI Offline")
        // 2. User gets a polite, generic response (No error details)

        const fallbackResponse = userRating >= 4
            ? "Thank you so much! We're thrilled you enjoyed your experience."
            : "Thank you for your feedback. We appreciate you visiting us.";

        return {
            stars: userRating,
            sentiment: userRating >= 4 ? 'positive' : 'neutral',
            explanation: "AI service temporarily unavailable. Using fallback logic.",
            ai_response: fallbackResponse, // Clean for user
            ai_summary: "System: AI Offline (Check Logs)", // Informative for admin
            ai_action: "Action: Manual Review Required",
            dimensions: {}
        };
    }
};
