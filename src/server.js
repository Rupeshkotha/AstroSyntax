// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '..', '..', 'build')));

// All other GET requests not handled by the API should return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
});

// ========== POST ROUTE ========== //
app.post('/api/idea', async (req, res) => {
  const { mode, technology, interests, theme, problemStatement } = req.body;

  let prompt = '';

  if (mode === 'surprise') {
    prompt = `
Generate 4 unique hackathon project ideas. Use this exact format:

Idea 1:
Title: ...
Problem Statement: ...
Solution Overview: ...
Suggested Tech Stack: ...
Bonus Features / Enhancements: ...
Demo Plan: ...
Target Audience / Impact: ...
Difficulty / Experience Level: ...
Resources: ...

Repeat for Idea 2, 3, and 4. Keep ideas unique and innovative.
    `;
  } else if (mode === 'guided') {
    prompt = `
Generate 4 hackathon project ideas based on the following inputs:

Technology: ${technology || 'any'}
Field of Interest: ${interests || 'any'}
Theme: ${theme || 'any'}

Use this format:
Idea 1:
Title: ...
Problem Statement: ...
Solution Overview: ...
Suggested Tech Stack: ...
Bonus Features / Enhancements: ...
Demo Plan: ...
Target Audience / Impact: ...
Difficulty / Experience Level: ...
Resources: ...

Be specific to the input. Make each idea unique.
    `;
  } else if (mode === 'problem') {
    prompt = `
The user has a specific problem statement. Based on this, suggest 3–4 project ideas that could help solve or address the problem creatively.

Problem Statement: "${problemStatement}"

Use the following format for each idea:

Idea X:
Title: ...
Problem Statement: ...
Solution Overview: ...
Suggested Tech Stack: ...
Bonus Features / Enhancements: ...
Demo Plan: ...
Target Audience / Impact: ...
Difficulty / Experience Level: ...
Resources: ...

Ensure the ideas are original and well-structured. Use the exact labels above. Keep each section concise.
    `;
  } else {
    return res.status(400).json({ error: 'Invalid mode selected.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that helps generate creative, technical, and impactful project ideas for hackathons or builders.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.choices?.[0]?.message?.content) {
      res.json({ idea: data.choices[0].message.content.trim() });
    } else {
      console.error('OpenRouter API error:', data);
      res.status(500).json({ error: 'Failed to generate ideas.' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ========== SERVER START ========== //
app.listen(PORT, () => {
  console.log(`🚀 Idea generator backend running at http://localhost:${PORT}`);
});
