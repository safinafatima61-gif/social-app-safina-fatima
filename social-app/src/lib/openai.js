import OpenAI from 'openai';

/**
 * Single OpenAI client for the whole app.
 * Local: social-app/.env → VITE_OPENAI_API_KEY (never commit)
 * Vercel: Project → Settings → Environment Variables → VITE_OPENAI_API_KEY
 * Vite inlines the key at build time — redeploy after changing Vercel env.
 */
const apiKey = String(import.meta.env.VITE_OPENAI_API_KEY || '')
  .trim()
  .replace(/^["']|["']$/g, '');

const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
  dangerouslyAllowBrowser: true, // required for frontend-only usage
});

export function isOpenAIConfigured() {
  return Boolean(apiKey) && apiKey.startsWith('sk-');
}

export function formatOpenAIError(err) {
  const status = err?.status || err?.response?.status;
  const msg = String(err?.message || err || 'AI request failed');

  if (!isOpenAIConfigured()) {
    return 'OpenAI key missing. Local: set VITE_OPENAI_API_KEY in social-app/.env and restart. Deployed: add it in Vercel Environment Variables and redeploy.';
  }
  if (status === 401 || /incorrect api key|invalid api key|unauthorized|authentication/i.test(msg)) {
    return 'Invalid OpenAI API key. Update VITE_OPENAI_API_KEY (local .env or Vercel env) and restart/redeploy.';
  }
  if (status === 429 || /rate limit/i.test(msg)) {
    return 'OpenAI rate limit — wait a moment and try again.';
  }
  if (status === 402 || /quota|billing|insufficient/i.test(msg)) {
    return 'OpenAI quota/billing issue — check your OpenAI account.';
  }
  if (/connection error|failed to fetch|network|cors|load failed/i.test(msg)) {
    return 'Network error calling OpenAI. Check internet connection.';
  }
  return msg.length > 160 ? `${msg.slice(0, 160)}…` : msg;
}

export default openai;
