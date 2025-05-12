import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Session {
  id: number;
  date: string;
  scripture: string;
  transcription: string;
  plaudSynopsis: string;
  prayerRequests: string;
  keyVerse: string;
  imageQuery: string;
  imageUrl?: string;
  aiSummary?: string;
  enhancedCommentary?: string;
  nextSessionPreview?: string;
  emailStatus?: string;
  emailSentTimestamp?: string;
  errorLog?: string;
}

// API functions
export const getSessions = async (): Promise<Session[]> => {
  try {
    const response = await api.get('/sessions');
    return response.data.sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const getSession = async (id: number): Promise<Session> => {
  try {
    const response = await api.get(`/sessions/${id}`);
    return response.data.session;
  } catch (error) {
    console.error(`Error fetching session ${id}:`, error);
    throw error;
  }
};

export const generateImage = async (
  verseText: string,
  searchQuery: string,
  sessionId?: number
): Promise<string> => {
  try {
    const response = await api.post('/generate-image', {
      verse_text: verseText,
      search_query: searchQuery,
      session_id: sessionId,
    });
    return response.data.image_url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export const triggerEmail = async (sessionId: number): Promise<void> => {
  try {
    await api.post(`/trigger-email/${sessionId}`);
  } catch (error) {
    console.error(`Error triggering email for session ${sessionId}:`, error);
    throw error;
  }
};

export default api;
