/**
 * Vercel Serverless Function: /api/oracle
 * Securely proxies request to either Gemini or OpenAI (ChatGPT) APIs using environment variables.
 */

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, zodiac, lifePath, language, question, model = 'gemini' } = req.body;

        // Basic validation
        if (!name || !zodiac || !lifePath || !question) {
            return res.status(400).json({ error: 'Missing required profile parameters' });
        }

        // System prompt context
        const systemPrompt = `You are a professional cosmic oracle, astrologer, and palmist. 
You have analyzed the seeker's hand lines and astronomical alignments.
Seeker Profile:
- Name: ${name}
- Zodiac Alignment: ${zodiac}
- Life Path Number: ${lifePath}

The seeker asks: "${question}"

Instructions:
1. Provide a mystical, encouraging, yet psychologically deep and comforting answer.
2. Incorporate subtle elements of their zodiac sign or Life Path number to make it highly personalized.
3. Answer in ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
4. Keep the response concise (2 to 3 short paragraphs). Do not use markdown headers; use standard text paragraphs and bold highlights.`;

        // ----------------------------------------------------
        // OPTION 1: CHATGPT (OPENAI)
        // ----------------------------------------------------
        if (model === 'chatgpt') {
            const openAiKey = process.env.OPENAI_API_KEY;
            if (!openAiKey) {
                console.error("Vercel Serverless Error: OPENAI_API_KEY environment variable is missing.");
                return res.status(500).json({ 
                    error: 'OpenAI API key is not configured on the server. Falling back to local engine.' 
                });
            }

            const openAiUrl = 'https://api.openai.com/v1/chat/completions';

            const response = await fetch(openAiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: systemPrompt
                        }
                    ],
                    max_tokens: 400,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("OpenAI API returned error:", errText);
                return res.status(response.status).json({ error: 'Failed to generate response from OpenAI API' });
            }

            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const answer = data.choices[0].message.content;
                return res.status(200).json({ answer });
            } else {
                console.error("Invalid response format from OpenAI API:", JSON.stringify(data));
                return res.status(502).json({ error: 'Received invalid response from OpenAI API' });
            }
        } 
        
        // ----------------------------------------------------
        // OPTION 2: GEMINI (GOOGLE) - DEFAULT
        // ----------------------------------------------------
        else {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (!geminiKey) {
                console.error("Vercel Serverless Error: GEMINI_API_KEY environment variable is missing.");
                return res.status(500).json({ 
                    error: 'Gemini API key is not configured on the server. Falling back to local engine.' 
                });
            }

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Gemini API returned error:", errText);
                return res.status(response.status).json({ error: 'Failed to generate response from Gemini API' });
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const answer = data.candidates[0].content.parts[0].text;
                return res.status(200).json({ answer });
            } else {
                console.error("Invalid response format from Gemini API:", JSON.stringify(data));
                return res.status(502).json({ error: 'Received invalid response from Gemini API' });
            }
        }

    } catch (error) {
        console.error("Serverless function crash error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
