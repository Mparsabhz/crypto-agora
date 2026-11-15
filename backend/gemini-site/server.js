const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/api/chat', async (req, res) => {
    try {
        const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

        if (!prompt) {
            return res.status(400).json({ error: 'Lipsește mesajul (prompt).' });
        }

        const completion = await groq.chat.completions.create({
            model: 'qwen/qwen3.8-27b',
            messages: [{ role: 'user', content: prompt }]
        });

        return res.json({
            reply: completion.choices[0]?.message?.content || ''
        });
    } catch (error) {
        console.error('Eroare Groq API:', error.message);
        return res.status(502).json({
            error: 'A apărut o eroare la generarea răspunsului.'
        });
    }
});

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Serverul Groq rulează pe http://localhost:${PORT}`);
});

process.stdin.resume();

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Serverul Groq a fost oprit.');
        process.stdin.pause();
    });
});
