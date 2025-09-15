# Paper → Polished Notes (Prototype)

Turn raw handwritten images or PDFs into clean, structured Markdown notes.  
If uncertain content is detected, the UI surfaces a clarification workflow.

## Tech Stack
- Frontend: React (CRA), Tailwind CSS, pdf.js, marked
- Backend: Node.js + Express
- (Future) OpenAI Vision/Multimodal integration for transcription & structure
- (Future) MongoDB for history & user accounts

## Features (v1)
- Upload multiple images or PDFs
- Client-side PDF → image conversion
- Submit to `/parse` (placeholder backend returns static Markdown with `[UNCLEAR]` marker)
- Detect unclear segments and prompt for clarification
- Live Markdown preview
- Copy & download `.md`
- Soft, calming UI theme (Headspace / Apple inspired)

## Getting Started

### 1. Clone
```bash
git clone <your-repo-url>
cd <repo-root>
```

### 2. Backend
```bash
cd backend
npm install
npm run start
# Server at http://localhost:5001
```

### 3. Frontend
```bash
cd ../frontend
npm install
npm start
# React at http://localhost:3000
```

### 4. Environment Variables (Optional)
In `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001
```

### 5. Flow
1. Drop images or PDFs
2. Click "Turn into Notes"
3. Placeholder returns Markdown
4. If `[UNCLEAR]` appears, modal prompts user to clarify
5. User replaces placeholders; final Markdown updates

## Tailwind Setup Notes
Already configured via `tailwind.config.js` + `postcss.config.js`.  
CRA picks up `@tailwind` directives in `src/index.css`.

## Replacing Placeholder with OpenAI
Inside `backend/server.js`, in `/parse`:
1. For each image, send to OpenAI vision/multimodal model (e.g. `gpt-4o` variants).
2. Use a system prompt instructing:
   - Output structured Markdown
   - Use fenced code blocks for code/math (later integrate KaTeX/MathJax)
   - Mark uncertain tokens as `[UNCLEAR]` and optionally include a bounding reference
3. Return aggregated Markdown.

Example pseudo:
```js
const openaiRes = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You convert handwriting to structured Markdown...' },
    { role: 'user', content: [
        { type: 'text', text: 'Transcribe these pages:' },
        ...images.map(img => ({ type: 'image_url', image_url: img }))
      ]
    }
  ]
});
```

## Future Enhancements
- OCR fallback (Tesseract) before OpenAI for cost optimization
- Bounding box cropping for uncertain segments
- Inline math rendering (KaTeX)
- User auth + note history
- Export to PDF / Notion / Obsidian
- Dark mode & accessibility improvements

## License
MIT (pending)

Enjoy the calm productivity ✨