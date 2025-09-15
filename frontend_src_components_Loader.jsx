import React from 'react';

export default function Loader({ label = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-mint-300 border-t-accent-400 animate-spin" />
        <div className="absolute inset-0 rounded-full animate-pulseSlow bg-accent-400/10" />
      </div>
      <p className="text-base-600 text-sm">{label}</p>
    </div>
  );
}