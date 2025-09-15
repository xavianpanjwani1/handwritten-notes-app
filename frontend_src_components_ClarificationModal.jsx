import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function ClarificationModal({ open, onClose, unclearSegments, onResolve }) {
  const [responses, setResponses] = useState({});

  const handleChange = (idx, value) => {
    setResponses(r => ({ ...r, [idx]: value }));
  };

  const handleSubmit = () => {
    onResolve(responses);
    setResponses({});
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-base-800/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-6 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-soft p-6 space-y-6 animate-fadeIn">
          <Dialog.Title className="text-xl font-semibold text-base-800 flex items-center gap-3">
            <span className="text-accent-500 text-2xl">🪄</span>
            Clarify Uncertain Sections
          </Dialog.Title>
          <p className="text-sm text-base-600">
            We found some segments that were unclear. Please provide corrections or transcriptions below.
          </p>

            {unclearSegments.length === 0 && (
              <p className="text-sm text-base-500 italic">No segments to clarify.</p>
            )}

          <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2">
            {unclearSegments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-base-100 rounded-lg p-4 border border-base-200 space-y-2"
              >
                <p className="text-xs uppercase tracking-wide text-base-500 font-medium">
                  Segment {idx + 1}
                </p>
                <p className="text-sm text-base-700">
                  Original placeholder: <code className="bg-base-200 px-1 rounded">[UNCLEAR]</code>
                </p>
                {seg.image && (
                  <img
                    src={seg.image}
                    alt="Unclear snippet"
                    className="rounded border border-base-300 max-h-40 object-contain"
                  />
                )}
                <textarea
                  className="w-full text-sm rounded-md border-base-300 focus:border-accent-400 focus:ring-accent-400/40 shadow-inner bg-white px-3 py-2 transition-colors"
                  placeholder="Type the correct text..."
                  rows={3}
                  value={responses[idx] || ''}
                  onChange={e => handleChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-base-200 hover:bg-base-300 text-base-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={unclearSegments.length === 0}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Clarifications
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}