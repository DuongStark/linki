// Auth Types
export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Vocab Types
export interface ReviewHistory {
  date: string;
  grade: number;
  interval: number;
  easeFactor: number;
}

export interface SRSData {
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
  state: 'new' | 'learning' | 'review';
  learningStepIndex: number;
}

// Stats Types
export interface StatsOverview {
  total: number;
  studied: number;
  mastered: number;
  dueToday: number;
  overdue: number;
  new: number;
}

export interface DailyStats {
  date: string;
  reviewCount: number;
  newCards: number;
}

// Notification Types
export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
}

export interface UserVocabProgress {
  _id: string;
  word: string;
  meaning: string;
  example?: string;
  audio?: string;
  phonetic?: string;
  image?: string;
  tags?: string[];
  definition?: string;
  pos?: string;
  srs: SRSData;
  reviewHistory: ReviewHistory[];
  vocabId: string;
  deck: string;
}

// Deck Types
export interface Deck {
  _id: string;
  name: string;
  type: 'shared' | 'personal';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} 