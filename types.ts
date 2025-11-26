export type Role = 'user' | 'model';

export enum ResearchLevel {
  QUICK = 'quick',       // Fast, internal knowledge
  MODERATE = 'moderate', // Search grounded
  DEEP = 'deep'          // Search + Thinking (Reasoning)
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 data URI
  isThinking?: boolean;
  sources?: GroundingSource[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface MemoryItem {
  id: string;
  fact: string;
  timestamp: number;
  category: 'correction' | 'preference' | 'fact';
}