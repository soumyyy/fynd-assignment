// Node.js Runtime (Standard Serverless)
// More stable IP reputation than Edge for 3rd party APIs
export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    // CORS Handling
    if (req.method === 'OPTIONS') {
        res.status(200).setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.status(200).setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const { model, messages, temperature, max_tokens, response_format } = body;

        const API_KEY = process.env.VITE_CEREBRAS_API_KEY;
        // Use user-provided base path or default
        const API_BASE = process.env.VITE_CEREBRAS_API_BASE || "https://api.cerebras.ai/v1";
        const url = `${API_BASE.replace(/\/+$/, "")}/chat/completions`;

        if (!API_KEY) {
            return res.status(500).json({ error: 'Server Config Error: Missing API Key' });
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "User-Agent": "FyndAssignment/1.0 (Vercel Serverless)" // Identify as legitimate client
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
                response_format
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cerebras API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        res.status(200).setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
}
