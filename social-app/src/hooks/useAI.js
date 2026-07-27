import { useCallback, useState } from 'react';
import openai, { isOpenAIConfigured, formatOpenAIError } from '../lib/openai';
import { storage } from '../services/storage';

/**
 * All OpenAI features in one hook.
 * Always: model 'gpt-4o-mini', max_tokens: 300.
 * Settings persist in localStorage key `aiSettings`.
 *
 * Features:
 *  3A generatePostContent
 *  3B suggestComment
 *  3C optimiseBio
 *  3D Mode 1 suggestChatReplies (fail silently)
 *  3D Mode 2 generateAutoReply (show error / toast)
 */

const DEFAULT_SETTINGS = {
  aiChatEnabled: false, // Mode 2 off by default — user must opt in
  aiMode: 'suggest', // Mode 1 default (always on)
  aiPersonality: 'friendly',
};

function personalityHint(personality) {
  const map = {
    friendly: 'Be warm, friendly and supportive.',
    professional: 'Be professional, clear and polished.',
    casual: 'Be casual, relaxed and conversational.',
    funny: 'Be witty and lightly humorous.',
  };
  return map[personality] || map.friendly;
}

function parseJsonBlock(text) {
  if (!text) return null;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    return null;
  }
}

function formatRecentMessages(recentMessages, userName, friendName) {
  return (recentMessages || [])
    .slice(-5)
    .map((m) => {
      const name = m.fromSelf ? userName : friendName;
      const body = m.type === 'text' ? m.content : `[${m.type}]`;
      return `${name}: ${body}`;
    })
    .join('\n');
}

/** Assignment call pattern — single client, gpt-4o-mini, max_tokens: 300 */
async function createCompletion(system, user) {
  if (!isOpenAIConfigured()) {
    const err = new Error('OpenAI API key not configured');
    err.status = 401;
    throw err;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || '';
}

export function useAI(userId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettingsState] = useState(() => {
    if (!userId) return { ...DEFAULT_SETTINGS };
    const all = storage.getAISettings();
    return { ...DEFAULT_SETTINGS, ...(all[userId] || {}) };
  });

  const getSettings = useCallback(() => {
    if (!userId) return { ...DEFAULT_SETTINGS };
    const all = storage.getAISettings();
    return { ...DEFAULT_SETTINGS, ...(all[userId] || {}) };
  }, [userId]);

  const saveSettings = useCallback(
    (partial) => {
      if (!userId) return;
      const all = storage.getAISettings();
      const nextUser = { ...DEFAULT_SETTINGS, ...(all[userId] || {}), ...partial };
      storage.setAISettings({ ...all, [userId]: nextUser });
      setSettingsState(nextUser);
    },
    [userId]
  );

  const run = useCallback(
    async (fn, emptyValue) => {
      setLoading(true);
      setError('');
      try {
        if (!userId) {
          setError('Please log in to use AI features.');
          return emptyValue;
        }
        if (!isOpenAIConfigured()) {
          setError(
            'OpenAI key missing. Add VITE_OPENAI_API_KEY in social-app/.env and restart npm run dev.'
          );
          return emptyValue;
        }
        return await fn();
      } catch (err) {
        setError(formatOpenAIError(err));
        return emptyValue;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // 3A — AI Post Generator
  const generatePostContent = useCallback(
    async (prompt) =>
      run(async () => {
        const system =
          'You are a social media writing assistant. The user will give you a brief idea for their post. Generate an engaging social media post. Return JSON: { "description": "..." }. Keep under 280 characters. Be natural and warm. No hashtags unless requested.';
        const text = await createCompletion(system, prompt);
        const parsed = parseJsonBlock(text);
        if (parsed?.description) return String(parsed.description).slice(0, 280);
        return text.slice(0, 280) || null;
      }, null),
    [run]
  );

  // 3B — AI Comment Suggestion
  const suggestComment = useCallback(
    async (postDescription) =>
      run(async () => {
        const system = `You are helping a user write a comment on a social media post. The post is: ${postDescription}. Write a short genuine comment (1-2 sentences). Be conversational. Do not use hashtags. Do not be generic like Great post.`;
        const text = await createCompletion(system, 'Suggest a comment.');
        return text || null;
      }, null),
    [run]
  );

  // 3C — AI Profile Optimiser
  const optimiseBio = useCallback(
    async ({ name, bio, location }) =>
      run(async () => {
        const system = `You are a professional profile writer. Current bio: ${bio || '(empty)'}. Name: ${name || ''}. Location: ${location || ''}. Write an improved bio that is professional, warm and engaging. Keep it under 150 characters. Return only the bio text.`;
        const text = await createCompletion(system, 'Improve this bio.');
        return text ? text.slice(0, 150) : null;
      }, null),
    [run]
  );

  // 3D Mode 1 — AI reply suggestions (fail silently)
  const suggestChatReplies = useCallback(
    async ({ userName, friendName, recentMessages }) => {
      setLoading(true);
      try {
        if (!userId || !isOpenAIConfigured()) return [];
        const current = getSettings();
        const recent = formatRecentMessages(recentMessages, userName, friendName);
        const system = `You are ${userName}'s messaging assistant. You are helping ${userName} reply to ${friendName}. Personality: ${current.aiPersonality}. ${personalityHint(current.aiPersonality)} Recent conversation: ${recent}. Generate 3 short natural reply options. Return JSON: { "suggestions": ["reply1", "reply2", "reply3"] }. Each suggestion under 100 characters. Match the conversational tone.`;
        const text = await createCompletion(system, 'Generate 3 reply suggestions.');
        const parsed = parseJsonBlock(text);
        if (Array.isArray(parsed?.suggestions)) {
          return parsed.suggestions.map(String).slice(0, 3);
        }
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[\d\-\*\.]+\s*/, '').replace(/^"|"$/g, '').trim())
          .filter(Boolean)
          .slice(0, 3);
        return lines.length ? lines : [];
      } catch {
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getSettings, userId]
  );

  // 3D Mode 2 — AI auto-reply (errors surface via `error` / toast)
  const generateAutoReply = useCallback(
    async ({ userName, friendName, recentMessages }) =>
      run(async () => {
        const current = getSettings();
        const recent = formatRecentMessages(recentMessages, userName, friendName);
        const system = `You are replying to ${friendName} on behalf of ${userName}. Personality: ${current.aiPersonality}. ${personalityHint(current.aiPersonality)} Recent conversation: ${recent}. Reply naturally as ${userName} would. Keep it short (1-3 sentences max). Do not reveal you are an AI unless directly asked.`;
        const text = await createCompletion(system, 'Write the reply.');
        return text || null;
      }, null),
    [run, getSettings]
  );

  return {
    loading,
    error,
    setError,
    settings,
    saveSettings,
    getSettings,
    isConfigured: isOpenAIConfigured(),
    generatePostContent,
    suggestComment,
    optimiseBio,
    suggestChatReplies,
    generateAutoReply,
  };
}
