import React, { useState, useRef } from 'react';
import { AdkSession, AdkEvent } from './types';
import { Upload, FileText, Info, X, MessageSquare } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DetailPanel from './components/DetailPanel';

export default function App() {
  const [session, setSession] = useState<AdkSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdkEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.events || !Array.isArray(json.events)) {
          throw new Error("Invalid ADK Session format: 'events' array missing.");
        }
        setSession(json);
        setError(null);
      } catch (err) {
        setError("Failed to parse JSON file. Please ensure it is a valid ADK session log.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const resetSession = () => {
    setSession(null);
    setSelectedEvent(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-slate-800">ADK Session Viewer</h1>
        </div>
        
        {session && (
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              <span className="font-medium text-slate-800">App:</span> {session.appName}
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              <span className="font-medium text-slate-800">User:</span> {session.userId}
            </div>
            <button 
              onClick={resetSession}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Close File
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {!session ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Session Log</h2>
              <p className="text-slate-500 mb-8">Select a JSON file generated from an ADK web session to visualize the conversation.</p>
              
              <label className="block w-full cursor-pointer group">
                <div className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl text-center shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-all transform group-hover:-translate-y-0.5">
                  Choose File
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json,application/json" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 text-left">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedEvent ? 'mr-0 md:mr-96' : ''}`}>
              <ChatInterface 
                events={session.events} 
                onEventSelect={setSelectedEvent}
                selectedEventId={selectedEvent?.id}
              />
            </div>

            {/* Detail Panel (Slide-over on desktop, Modal on mobile could be implemented, keeping simple split view logic for now) */}
            {selectedEvent && (
              <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-slate-200 z-20 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 top-14">
                 <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Message Details
                    </h3>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <DetailPanel event={selectedEvent} />
                 </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
