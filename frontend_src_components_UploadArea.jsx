import React, { useRef } from 'react';
import clsx from 'clsx';

export default function UploadArea({ onFilesSelected, isProcessing }) {
  const inputRef = useRef();

  const handleFiles = files => {
    if (!files || !files.length) return;
    onFilesSelected(Array.from(files));
  };

  const onDrop = e => {
    e.preventDefault();
    if (isProcessing) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer',
        'bg-white/60 backdrop-blur-sm hover:bg-white shadow-soft',
        isProcessing && 'opacity-60 pointer-events-none'
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center">
          <span className="text-accent-500 text-2xl">✏️</span>
        </div>
        <p className="text-base-700 font-medium">
          Drag & Drop handwritten images or PDFs
        </p>
        <p className="text-sm text-base-500">
          Click to browse — we will turn them into polished Markdown
        </p>
      </div>
    </div>
  );
}