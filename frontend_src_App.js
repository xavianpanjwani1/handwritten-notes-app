import React, { useState, useCallback, useEffect } from 'react';
import UploadArea from './components/UploadArea';
import Loader from './components/Loader';
import MarkdownPreview from './components/MarkdownPreview';
import ClarificationModal from './components/ClarificationModal';
import { pdfFileToImages } from './utils/pdfToImages';
import { marked } from 'marked';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [files, setFiles] = useState([]);
  const [base64Images, setBase64Images] = useState([]);
  const [markdown, setMarkdown] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showClarify, setShowClarify] = useState(false);
  const [unclearSegments, setUnclearSegments] = useState([]);
  const [error, setError] = useState('');

  const handleFilesSelected = async selected => {
    setError('');
    setFiles(prev => [...prev, ...selected]);
  };

  const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Whenever files change, convert them
  useEffect(() => {
    if (files.length === 0) return;
    let canceled = false;

    (async () => {
      const allImages = [];
      for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            const imgs = await pdfFileToImages(file);
            allImages.push(...imgs);
          } catch (err) {
            console.error('PDF parse error:', err);
            setError('Failed to process one of the PDFs.');
          }
        } else if (file.type.startsWith('image/')) {
          try {
            const b64 = await convertFileToBase64(file);
            allImages.push(b64);
          } catch (err) {
            console.error('Image parse error:', err);
          }
        } else {
            console.warn('Unsupported file:', file.name);
        }
      }
      if (!canceled) setBase64Images(allImages);
    })();

    return () => { canceled = true; };
  }, [files]);

  const handleParse = useCallback(async () => {
    if (!base64Images.length) {
      setError('Please add at least one image or PDF.');
      return;
    }
    setProcessing(true);
    setError('');
    setMarkdown('');
    try {
      const res = await fetch(`${BACKEND_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images })
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setMarkdown(data.markdown || '');

      // Detect [UNCLEAR] tokens
      if ((data.markdown || '').includes('[UNCLEAR]')) {
        // For v1 we don't have sub-images for unclear regions. Later we'll map bounding boxes.
        const segments = (data.markdown.match(/\[UNCLEAR\]/g) || []).map(() => ({
          image: null
        }));
        setUnclearSegments(segments);
        setShowClarify(true);
      }
    } catch (err) {
      console.error(err);
      setError('Parsing failed. Check backend.');
    } finally {
      setProcessing(false);
    }
  }, [base64Images]);

  const applyClarifications = responses => {
    let updated = markdown;
    // Replace sequential [UNCLEAR] occurrences in order
    Object.keys(responses)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(idx => {
        const answer = responses[idx]?.trim();
        if (answer) {
          updated = updated.replace('[UNCLEAR]', answer);
        }
      });
    setMarkdown(updated);
    setShowClarify(false);
    setUnclearSegments([]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'notes.md';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFile = index => {
    setFiles(f => f.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center text-xl">
            🗒️
          </div>
          <h1 className="text-xl font-semibold text-base-800 tracking-tight">
            Paper → Polished Notes
          </h1>
        </div>
        <div className="text-xs text-base-500">
          v1 (Prototype)
        </div>
      </header>

      <main className="flex-1 px-6 pb-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <UploadArea
              onFilesSelected={handleFilesSelected}
              isProcessing={processing}
            />

            {files.length > 0 && (
              <div className="bg-white shadow-soft rounded-xl p-4 space-y-3 animate-fadeIn">
                <h2 className="text-sm font-semibold text-base-700 uppercase tracking-wide">
                  Selected Files
                </h2>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {files.map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-sm bg-base-100 rounded-md px-3 py-2"
                    >
                      <span className="truncate max-w-[70%]">{f.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-xs text-accent-600 hover:text-accent-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleParse}
                  disabled={processing}
                  className="w-full mt-2 py-3 font-medium rounded-lg bg-accent-500 text-white shadow-soft hover:bg-accent-600 transition-all disabled:opacity-50"
                >
                  {processing ? 'Working...' : 'Turn into Notes'}
                </button>
                {error && (
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                )}
              </div>
            )}

            {processing && (
              <div className="bg-white rounded-xl shadow-soft">
                <Loader label="Transcribing & Structuring..." />
              </div>
            )}

          </section>

          <section className="flex flex-col gap-4">
            <div className="bg-white shadow-soft rounded-xl p-5 flex-1 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-700">
                  Markdown Preview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!markdown}
                    className="text-xs px-3 py-1.5 rounded-md bg-base-200 hover:bg-base-300 text-base-700 transition disabled:opacity-40"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!markdown}
                    className="text-xs px-3 py-1.5 rounded-md bg-mint-300 hover:bg-mint-500 text-base-800 font-medium transition disabled:opacity-40"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto rounded-lg border border-base-200 bg-base-50 p-4">
                {markdown ? (
                  <MarkdownPreview markdown={markdown} />
                ) : (
                  <p className="text-sm text-base-400 italic">
                    Output will appear here...
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-base-400 text-center">
              Future: store history, allow editing inline, math rendering.
            </div>
          </section>
        </div>
      </main>

      <ClarificationModal
        open={showClarify}
        onClose={() => setShowClarify(false)}
        unclearSegments={unclearSegments}
        onResolve={applyClarifications}
      />
      <footer className="py-6 text-center text-xs text-base-400">
        Built with calm design in mind. ✨
      </footer>
    </div>
  );
}

export default App;