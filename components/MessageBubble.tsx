import React from 'react';
import { AdkEvent, ContentPart } from '../types';
import { Bot, User, Wrench, Terminal, ChevronRight, Clock } from 'lucide-react';

interface MessageBubbleProps {
  event: AdkEvent;
  isUser: boolean;
  onClick: () => void;
  isSelected: boolean;
}

const formatTime = (timestamp: number) => {
  // Check if timestamp is in seconds (ADK usually uses float seconds) or ms
  const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ event, isUser, onClick, isSelected }) => {
  const parts = event.content?.parts || [];
  const authorName = event.author || (isUser ? 'User' : 'Agent');
  const timestamp = formatTime(event.timestamp);

  // Determine container styles
  const containerClasses = isUser
    ? "flex flex-col items-end max-w-[85%] md:max-w-[75%]"
    : "flex flex-col items-start max-w-[85%] md:max-w-[75%]";

  const bubbleBaseClasses = isUser
    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-sm"
    : `bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500 border-transparent' : ''}`;

  return (
    <div className={containerClasses}>
      {/* Header Info */}
      <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${isUser ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>
        <span className="text-xs font-medium text-slate-500">{authorName}</span>
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          <Clock size={10} /> {timestamp}
        </span>
      </div>

      {/* Message Content */}
      <div 
        className={`p-4 overflow-hidden w-full ${bubbleBaseClasses}`}
        onClick={!isUser ? onClick : undefined}
      >
        <div className="space-y-3">
          {parts.map((part, index) => (
            <PartRenderer key={index} part={part} isUser={isUser} />
          ))}
          
          {parts.length === 0 && (
            <div className="italic opacity-50 text-sm">No content</div>
          )}
        </div>
        
        {/* Click hint for assistant messages */}
        {!isUser && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            <span>{event.modelVersion || 'Assistant'}</span>
            <div className="flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
              Details <ChevronRight size={12} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component to render different part types
const PartRenderer: React.FC<{ part: ContentPart; isUser: boolean }> = ({ part, isUser }) => {
  // 1. Plain Text
  if (part.text) {
    return (
      <div className={`whitespace-pre-wrap leading-relaxed text-sm ${isUser ? 'text-indigo-50' : 'text-slate-700'}`}>
        {part.text}
      </div>
    );
  }

  // 2. Function Call
  if (part.functionCall) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono my-1">
        <div className="flex items-center gap-2 text-amber-600 mb-2 border-b border-slate-200 pb-2">
          <Wrench size={14} />
          <span className="font-semibold text-xs uppercase tracking-wide">Tool Call</span>
        </div>
        <div className="text-slate-800 font-bold mb-1">{part.functionCall.name}</div>
        <div className="text-xs text-slate-500 overflow-x-auto custom-scrollbar bg-slate-100 p-2 rounded">
          {JSON.stringify(part.functionCall.args, null, 2)}
        </div>
      </div>
    );
  }

  // 3. Function Response
  if (part.functionResponse) {
    return (
      <div className="bg-slate-900 text-slate-200 rounded-lg p-3 text-sm font-mono my-1 border-l-4 border-emerald-500 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 mb-2 border-b border-slate-700 pb-2">
          <Terminal size={14} />
          <span className="font-semibold text-xs uppercase tracking-wide">Tool Output</span>
        </div>
        <div className="font-bold mb-1">{part.functionResponse.name}</div>
        <div className="text-xs text-slate-400 overflow-x-auto custom-scrollbar max-h-40 bg-black/30 p-2 rounded">
           {JSON.stringify(part.functionResponse.response, null, 2)}
        </div>
      </div>
    );
  }

  return null;
};

export default MessageBubble;
