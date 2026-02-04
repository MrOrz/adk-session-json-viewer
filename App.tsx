import React, { useState, useRef, useEffect } from 'react';
import { AdkSession, AdkEvent } from './types';
import { Upload, FileText, Info, X, MessageSquare, Cloud, Loader2 } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DetailPanel from './components/DetailPanel';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_APP_ID = process.env.GOOGLE_APP_ID;

export default function App() {
  const [session, setSession] = useState<AdkSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdkEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', () => {
          console.log('Google Picker API loaded');
        });
      }
    };

    if (window.gapi) {
      initGapi();
    } else {
      const script = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      script?.addEventListener('load', initGapi);
    }

    // Check for fileId in URL
    const params = new URLSearchParams(window.location.search);
    const fileId = params.get('fileId');
    if (fileId && GOOGLE_API_KEY) {
      loadSessionFromDrive(fileId);
    }
  }, []);

  const handleGoogleDrivePick = () => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      setError("Google Drive integration is not configured. Please provide API Key and Client ID.");
      return;
    }

    if (!window.google) {
      setError("Google API failed to load. Please check your internet connection.");
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: async (response: any) => {
        if (response.error !== undefined) {
          setError(`Google Auth Error: ${response.error}`);
          return;
        }
        setAccessToken(response.access_token);
        createPicker(response.access_token);
      },
    });

    if (accessToken === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const createPicker = (token: string) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setAppId(GOOGLE_APP_ID)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = (data: any) => {
    if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
      const doc = data[window.google.picker.Response.DOCUMENTS][0];
      const fileId = doc[window.google.picker.Document.ID];
      loadSessionFromDrive(fileId);
    }
  };

  const loadSessionFromDrive = async (fileId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const json = await response.json();
      if (!json.events || !Array.isArray(json.events)) {
        throw new Error("Invalid ADK Session format: 'events' array missing.");
      }
      setSession(json);
      // Update URL with fileId
      const url = new URL(window.location.href);
      url.searchParams.set('fileId', fileId);
      window.history.pushState({}, '', url.toString());
    } catch (err: any) {
      setError(err.message || "Failed to load session from Google Drive.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
              
              <div className="space-y-4">
                <label className="block w-full cursor-pointer group">
                  <div className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl text-center shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-all transform group-hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Choose Local File
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  onClick={handleGoogleDrivePick}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white text-slate-700 font-medium rounded-xl text-center border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  ) : (
                    <Cloud className="w-5 h-5 text-indigo-600" />
                  )}
                  {isLoading ? 'Loading...' : 'Load from Google Drive'}
                </button>
              </div>
              
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
