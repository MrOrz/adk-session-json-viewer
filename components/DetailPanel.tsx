import React from 'react';
import { AdkEvent } from '../types';
import { Copy, Check } from 'lucide-react';

interface DetailPanelProps {
  event: AdkEvent;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ event }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">ID</div>
          <div className="text-xs font-mono text-slate-700 break-all">{event.id}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Author</div>
          <div className="text-xs font-medium text-slate-700">{event.author}</div>
        </div>
      </div>

      {/* Token Usage */}
      {event.usageMetadata && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Token Usage</h4>
          <div className="grid grid-cols-3 gap-2">
             <div className="text-center p-2 bg-indigo-50 rounded border border-indigo-100">
                <div className="text-lg font-bold text-indigo-600">{event.usageMetadata.promptTokenCount}</div>
                <div className="text-[10px] text-indigo-400">Prompt</div>
             </div>
             <div className="text-center p-2 bg-emerald-50 rounded border border-emerald-100">
                <div className="text-lg font-bold text-emerald-600">{event.usageMetadata.candidatesTokenCount}</div>
                <div className="text-[10px] text-emerald-400">Response</div>
             </div>
             <div className="text-center p-2 bg-slate-100 rounded border border-slate-200">
                <div className="text-lg font-bold text-slate-600">{event.usageMetadata.totalTokenCount}</div>
                <div className="text-[10px] text-slate-400">Total</div>
             </div>
          </div>
        </div>
      )}

      {/* Thought Signature */}
      {event.content?.thoughtSignature && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Thought Signature</h4>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2">
             <div className="text-[10px] text-slate-500 font-mono break-all line-clamp-4 hover:line-clamp-none transition-all cursor-help" title="Click to expand">
                {event.content.thoughtSignature}
             </div>
          </div>
        </div>
      )}

      {/* Raw JSON */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Raw JSON</h4>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-slate-400" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="relative">
          <pre className="text-[10px] leading-4 font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto custom-scrollbar">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
