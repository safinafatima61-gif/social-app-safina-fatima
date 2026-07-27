import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const baseURL = import.meta.env.VITE_OPENAI_BASE_URL || undefined;

const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
  dangerouslyAllowBrowser: true, // required for frontend-only usage
});

export function isOpenAIConfigured() {
  return Boolean(apiKey && String(apiKey).trim());
}

export default openai;
