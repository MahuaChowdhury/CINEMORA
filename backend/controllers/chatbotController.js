/** Proxy to the xAI Grok API so the API key never reaches the browser. */
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-3';

const SYSTEM_PROMPT = `You are "Mora", the helpful assistant for CINEMORA, a movie-streaming app.

You can help users with:
- Finding and discovering movies by genre, year, or mood
- Explaining how My List (watchlist) and the Admin Panel work
- Account basics (registration, email OTP verification, login)
- General movie recommendations and trivia

Guidelines:
- Be friendly, concise, and conversational.
- If asked about a specific movie title that isn't in the catalog, say you don't have real-time catalog access and suggest browsing the app.
- Never ask for passwords, email addresses, or personal data.
- Never pretend to be a human or claim to watch movies.
- If the user asks something unrelated to movies or the app, politely steer back or give a brief helpful answer.`;

export async function chatbot(req, res) {
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Chatbot is not configured. Set GROK_API_KEY in backend/.env.' });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message too long (max 2000 characters)' });
    }

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('Grok API error:', response.status, body);
      return res.status(502).json({ message: 'Chatbot service temporarily unavailable.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm not sure how to respond to that.";
    res.json({ reply });
  } catch (error) {
    console.error('chatbot error:', error.message);
    res.status(500).json({ message: 'Chatbot request failed' });
  }
}
