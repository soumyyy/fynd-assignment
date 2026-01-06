export const config = {
    runtime: 'edge', // Edge is faster and cheaper
};

export default async function handler(req) {
    // CORS Handling for the API endpoint itself
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { model, messages, temperature, max_tokens, response_format } = body;

        // Use environment variable from Vercel Project Settings
        const API_KEY = process.env.VITE_CEREBRAS_API_KEY;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: 'Server Config Error: Missing API Key' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
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

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response(JSON.stringify({
            error: 'Failed to process request',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });
    }
}
