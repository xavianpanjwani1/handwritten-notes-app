import React from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export default function MarkdownPreview({ markdown }) {
  return (
    <div className="markdown-body text-sm leading-relaxed">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: marked.parse(markdown || '') }}
      />
    </div>
  );
}