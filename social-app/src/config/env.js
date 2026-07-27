/**
 * Central env config — put secrets in `.env` (never commit that file).
 *
 * .env example:
 *   VITE_OPENAI_API_KEY=sk-your-key-here
 *   VITE_OPENAI_BASE_URL=https://api.openai.com/v1   (optional)
 *
 * Optional legacy backend URL (not required for Assignment 2):
 *   VITE_API_BASE_URL=https://your-api.com/api
 */

export const ENV = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || '',
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
};

export function isOpenAIConfigured() {
  return Boolean(ENV.OPENAI_API_KEY && String(ENV.OPENAI_API_KEY).trim());
}

/** Optional backend — Assignment 2 AI uses OpenAI directly, not this. */
export function isApiConfigured() {
  return Boolean(ENV.API_BASE_URL);
}
