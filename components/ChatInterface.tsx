import React, { useEffect, useRef } from 'react';
import { AdkEvent } from '../types';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  events: AdkEvent[];
  onEventSelect: (event: AdkEvent) => void;
  selectedEventId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ events, onEventSelect, selectedEventId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [events]);

  // Sort events by timestamp just in case
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Start Marker */}
        <div className="flex justify-center">
          <span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
            Session Start
          </span>
        </div>

        {sortedEvents.map((event) => {
          // Normalize author. 'user' is user. 'writer', 'model', or others are assistant.
          const isUser = event.author === 'user';

          return (
            <div
              key={event.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <MessageBubble
                event={event}
                isUser={isUser}
                onClick={() => !isUser && onEventSelect(event)}
                isSelected={selectedEventId === event.id}
              />
            </div>
          );
        })}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatInterface;
