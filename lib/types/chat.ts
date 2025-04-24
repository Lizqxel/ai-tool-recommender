export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserPreferences {
  purpose?: string;
  budget?: '無料' | '有料';
  technicalLevel?: '初心者' | '中級者' | '上級者';
  priorities?: string[];
  limitations?: string[];
}

export interface ChatState {
  messages: Message[];
  preferences: UserPreferences;
  isCollectingPreferences: boolean;
  currentQuestion?: string;
} 