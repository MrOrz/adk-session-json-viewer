export interface AdkSession {
  id: string;
  appName: string;
  userId: string;
  state: Record<string, any>;
  events: AdkEvent[];
  lastUpdateTime: number;
}

export interface AdkEvent {
  id: string;
  timestamp: number;
  author: 'user' | 'writer' | 'model' | string;
  content: {
    role?: 'user' | 'model';
    parts: ContentPart[];
    thoughtSignature?: string;
  };
  modelVersion?: string;
  usageMetadata?: {
    candidatesTokenCount: number;
    promptTokenCount: number;
    totalTokenCount: number;
    thoughtsTokenCount?: number;
  };
  // Allow for other fields
  [key: string]: any;
}

export interface ContentPart {
  text?: string;
  functionCall?: FunctionCall;
  functionResponse?: FunctionResponse;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface FunctionResponse {
  id: string;
  name: string;
  response: Record<string, any>;
}
