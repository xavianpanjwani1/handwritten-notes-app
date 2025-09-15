import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Ensure key is present
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. /parse will return a placeholder.');
}

let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const PORT = process.env.PORT || 5001;

/**
 * System prompt to guide transcription behavior
 */
function systemPrompt() {
  return `You are a handwriting transcription + structuring assistant.

Requirements:
- Output ONLY valid Markdown.
- Use clear hierarchical headings (#, ##, ###) where logical.
- Use bullet lists for enumerations; tables only if structure is clear.
- Preserve math: inline $...$, block $$...$$. Do NOT fabricate LaTeX.
- If any portion is illegible or ambiguous, insert literal [UNCLEAR].
- Do NOT hallucinate content or expand beyond what is present.
- Keep style concise, neutral, and clean.`;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: process.env.OPENAI_API_KEY ? 'live' : 'placeholder' });
});

/**
 * POST /parse
 * Body: { images: [ "data:image/png;base64,...", ... ] }
 */
app.post('/parse', async (req, res) => {
  const { images } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'images array required' });
  }

  // Fallback placeholder if no key present
  if (!openaiClient) {
    return res.json({
      markdown: `# Sample Notes (Placeholder Mode)

OpenAI API key not configured.

- Received ${images.length} image(s)
- This is fallback static content
- Add your key in backend/.env as OPENAI_API_KEY

Example uncertain segment: [UNCLEAR]
`
    });
  }

  try {
    const userContent = [
      {
        type: 'text',
        text: 'Transcribe and structure these handwritten note pages into clean Markdown following the rules.'
      },
      ...images.map(img => ({
        type: 'image_url',
        image_url: { url: img }
      }))
    ];

    const response = await openaiClient.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      input: [
        {
          role: 'system',
            content: systemPrompt()
        },
        {
          role: 'user',
          content: userContent
        }
      ]
    });

    // Extract text output
    let markdown = '';

    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === 'output_text' && item.text) {
          markdown += item.text;
        }
      }
    } else if (response.output_text) {
      markdown = response.output_text;
    }

    if (!markdown.trim()) {
      markdown = '# (No transcription returned)\n\n[UNCLEAR]';
    }

    res.json({ markdown });
  } catch (err) {
    console.error('OpenAI error:', err?.response?.data || err);
    res.status(500).json({ error: 'Failed to process images' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});