import axios from 'axios';
import { VocabCard, StatsOverview, DailyStats, Deck, UserVocabProgress } from '../types';
declare var process: { env: { [key: string]: string } };
// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Vocab API
export const vocabAPI = {
  getAll: async (): Promise<VocabCard[]> => {
    const response = await api.get('/vocab');
    return response.data;
  },
  create: async (vocabData: Partial<VocabCard>): Promise<VocabCard> => {
    const response = await api.post('/vocab', vocabData);
    return response.data;
  },
  update: async (id: string, vocabData: Partial<VocabCard>): Promise<VocabCard> => {
    const response = await api.put(`/vocab/${id}`, vocabData);
    return response.data;
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/vocab/${id}`);
    return response.data;
  },
  review: async (id: string, grade: number): Promise<VocabCard> => {
    const response = await api.post(`/vocab/${id}/review`, { grade });
    return response.data;
  },
  getDueCards: async (): Promise<VocabCard[]> => {
    const now = new Date().toISOString();
    const response = await api.get(`/vocab?dueDate=${now}`);
    return response.data;
  },
  getAllDueCards: async (): Promise<VocabCard[]> => {
    const response = await api.get('/vocab?allDue=true');
    return response.data;
  },
  getNextDue: async (deckId?: string, deckType?: string): Promise<{ hours: number|null, minutes: number|null }> => {
    let url = '/vocab/next-due';
    if (deckId && deckType) {
      url += `?deckId=${deckId}&deckType=${deckType}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  getAllCards: async (): Promise<VocabCard[]> => {
    const response = await api.get('/vocab/all');
    return response.data;
  },
  importShared: async (): Promise<{ message: string }> => {
    const response = await api.post('/vocab/import-shared');
    return response.data;
  }
};

// Stats API
export const statsAPI = {
  getOverview: async (): Promise<StatsOverview> => {
    const response = await api.get('/stats');
    return response.data;
  },
  getDailyStats: async (): Promise<DailyStats[]> => {
    const response = await api.get('/stats/daily');
    return response.data;
  }
};

// TTS API
export const ttsAPI = {
  getAudioUrl: (word: string): string => {
    return `${api.defaults.baseURL}/tts/${encodeURIComponent(word)}`;
  },
  getAudioForBatch: async (words: string[]) => {
    const response = await api.post('/tts/batch', { words });
    return response.data.audioUrls;
  }
};

// Notifications API
export const notificationsAPI = {
  subscribe: async (subscription: PushSubscription) => {
    const response = await api.post('/notifications/subscribe', subscription);
    return response.data;
  },
  updateSettings: async (settings: { enabled?: boolean; dailyReminder?: boolean; reminderTime?: string }) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
  sendReminder: async () => {
    const response = await api.post('/notifications/send-reminder');
    return response.data;
  }
};

export const deckAPI = {
  getDecks: async (): Promise<Deck[]> => {
    const response = await api.get('/vocab/decks');
    return response.data;
  },
  importDeck: async (deckId: string): Promise<{ message: string }> => {
    const response = await api.post(`/vocab/decks/import/${deckId}`);
    return response.data;
  },
  getDeckProgress: async (deckId: string): Promise<UserVocabProgress[]> => {
    const response = await api.get(`/vocab/decks/${deckId}/progress`);
    return response.data;
  },
  getDeckVocab: async (deckId: string): Promise<any[]> => {
    const response = await api.get(`/vocab/decks/${deckId}/vocab`);
    return response.data;
  },
  getDeckDue: async (deckId: string): Promise<UserVocabProgress[]> => {
    const response = await api.get(`/vocab/decks/${deckId}/due`);
    return response.data;
  },
  getDeckDueCount: async (deckId: string): Promise<{ count: number }> => {
    const response = await api.get(`/vocab/decks/${deckId}/due?count=true`);
    return response.data;
  },
  getDeck: async (deckId: string): Promise<Deck> => {
    const response = await api.get(`/vocab/decks/${deckId}`);
    return response.data;
  },
};

export default api; 