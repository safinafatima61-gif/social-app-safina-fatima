import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useAI } from '../hooks/useAI';
import { storage } from '../services/storage';
import { areFriends } from '../utils/friendHelpers';
import RequireAuth from '../components/RequireAuth';
import ConversationList from '../components/chat/ConversationList';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import AISuggestionChips from '../components/chat/AISuggestionChips';
import AIChatBanner from '../components/chat/AIChatBanner';
import TypingIndicator from '../components/chat/TypingIndicator';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import clsx from 'clsx';

function ChatPageContent() {
  const { userId: friendId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    messages,
    conversations,
    sendMessage,
    toggleReaction,
    isUserOnline,
    activeFriendId,
  } = useChat(currentUser.id, friendId || null);
  const {
    settings,
    saveSettings,
    suggestChatReplies,
    generateAutoReply,
    loading: aiLoading,
    error: aiError,
    setError: setAiError,
    isConfigured,
  } = useAI(currentUser.id);

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [draft, setDraft] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const bottomRef = useRef(null);
  const autoReplyTimer = useRef(null);
  const lastAutoRepliedMsgId = useRef(null);

  const friend = friendId
    ? storage.getUsers().find((u) => String(u.id) === String(friendId))
    : null;

  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const lastFromFriend = Boolean(
    lastMessage && lastMessage.senderId !== currentUser.id
  );

  // Redirect if not friends
  useEffect(() => {
    if (!friendId) return;
    if (!areFriends(currentUser.id, friendId)) {
      navigate('/friends', { state: { message: 'You can only chat with friends.' } });
    }
  }, [friendId, currentUser.id, navigate]);

  // Reset AI UI when switching conversations
  useEffect(() => {
    setSuggestions([]);
    setDraft('');
    lastAutoRepliedMsgId.current = null;
  }, [friendId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, aiLoading]);

  async function loadSuggestions(forMessages = messages) {
    if (!friendId || !forMessages.length) return [];
    const recent = forMessages.slice(-5).map((m) => ({
      ...m,
      fromSelf: m.senderId === currentUser.id,
    }));
    const chips = await suggestChatReplies({
      userName: currentUser.name,
      friendName: friend?.name || 'Friend',
      recentMessages: recent,
    });
    return chips;
  }

  // 3D — Mode 1 suggestions (default) + Mode 2 auto-reply (opt-in)
  useEffect(() => {
    if (!friendId || !lastMessage) return;
    if (!lastFromFriend) {
      setSuggestions([]);
      return;
    }

    const mode = settings.aiMode || 'suggest';
    if (mode === 'off') {
      setSuggestions([]);
      return;
    }

    // Mode 2 — AI replies on user's behalf (must be explicitly enabled)
    if (mode === 'auto' && settings.aiChatEnabled) {
      if (lastAutoRepliedMsgId.current === lastMessage.id) return;
      lastAutoRepliedMsgId.current = lastMessage.id;
      setSuggestions([]);

      if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      let cancelled = false;
      autoReplyTimer.current = setTimeout(async () => {
        const recent = messages.slice(-5).map((m) => ({
          ...m,
          fromSelf: m.senderId === currentUser.id,
        }));
        const reply = await generateAutoReply({
          userName: currentUser.name,
          friendName: friend?.name || 'Friend',
          recentMessages: recent,
        });
        if (cancelled) return;
        if (reply) {
          try {
            sendMessage({
              receiverId: friendId,
              type: 'text',
              content: reply,
              aiGenerated: true,
            });
          } catch {
            setToast('AI reply failed — please reply manually');
          }
        } else {
          setToast('AI reply failed — please reply manually');
        }
      }, 1500); // 1–2s delay to feel natural

      return () => {
        cancelled = true;
        if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      };
    }

    // Mode 1 — 3 reply chips when friend messages (fail silently)
    let cancelled = false;
    (async () => {
      const chips = await loadSuggestions(messages);
      if (!cancelled) setSuggestions(chips);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on new last message / mode
  }, [
    friendId,
    lastMessage?.id,
    lastFromFriend,
    settings.aiMode,
    settings.aiChatEnabled,
  ]);

  useEffect(() => {
    if (aiError) {
      setToast(aiError);
      setAiError('');
    }
  }, [aiError, setAiError]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) => m.type === 'text' && m.content.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const displayMessages = searchQuery.trim() ? filteredMessages : messages;
  const online = friend ? isUserOnline(friend) : false;

  function handleSend({ type, content }) {
    if (!friendId) {
      setToast('Select a friend to chat with');
      return;
    }
    try {
      sendMessage({ receiverId: friendId, type, content, aiGenerated: false });
      setSuggestions([]);
      setDraft('');
    } catch (err) {
      setToast(err.message || 'Failed to send message');
    }
  }

  function setAiMode(mode) {
    saveSettings({
      aiMode: mode,
      aiChatEnabled: mode === 'auto',
    });
    setAiMenuOpen(false);
    if (mode === 'suggest') {
      setToast('AI suggestions enabled');
    } else if (mode === 'auto') {
      setToast('AI will reply for you');
    } else {
      setToast('AI turned off');
      setSuggestions([]);
    }
  }

  async function handleManualSuggest() {
    if (!isConfigured) {
      setToast('OpenAI key missing — check social-app/.env and restart npm run dev');
      return;
    }
    if (!messages.length) {
      setToast('Send or receive a message first');
      return;
    }
    const chips = await loadSuggestions(messages);
    setSuggestions(chips);
    if (!chips.length) {
      setToast('No suggestions returned — try again');
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <aside
        className={clsx(
          'w-full border-r border-slate-200 dark:border-slate-800 md:w-80 md:block',
          friendId ? 'hidden' : 'block'
        )}
      >
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Chat</h1>
          <Link
            to="/friends"
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Friends
          </Link>
        </div>
        <ConversationList
          conversations={conversations}
          activeFriendId={activeFriendId || friendId}
          onSelect={(id) => navigate(`/chat/${id}`)}
        />
      </aside>

      <section
        className={clsx(
          'flex h-full flex-1 flex-col',
          friendId ? 'flex' : 'hidden md:flex'
        )}
      >
        {!friendId || !friend ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-slate-500 md:hidden dark:text-slate-400"
                  onClick={() => navigate('/chat')}
                  aria-label="Back"
                >
                  ←
                </button>
                <Link to={`/profile/${friend.id}`} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={friend.avatar} name={friend.name} size="md" />
                    {online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{friend.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {online ? 'Online' : 'Offline'}
                      {settings.aiMode === 'auto' && settings.aiChatEnabled
                        ? ` · AI (${settings.aiPersonality})`
                        : settings.aiMode === 'suggest'
                          ? ' · AI suggestions on'
                          : ''}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSuggest}
                  disabled={aiLoading}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                  title="Get AI reply suggestions"
                >
                  ✨ Suggest
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Search messages"
                >
                  🔍
                </button>
                <button
                  type="button"
                  onClick={() => setAiMenuOpen((v) => !v)}
                  className="rounded-lg border border-blue-400 bg-blue-600 px-2.5 py-1 text-sm font-bold text-white hover:bg-blue-700 dark:border-blue-500"
                >
                  AI ▾
                </button>
                {aiMenuOpen && (
                  <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {!isConfigured && (
                      <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                        API key not loaded — restart npm run dev
                      </p>
                    )}
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => setAiMode('suggest')}
                    >
                      Suggest replies only
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => setAiMode('auto')}
                    >
                      Let AI reply for me
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => setAiMode('off')}
                    >
                      Turn off AI
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <p className="px-3 py-1 text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">
                      Personality
                    </p>
                    {['friendly', 'professional', 'casual', 'funny'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={clsx(
                          'block w-full rounded-lg px-3 py-2 text-left text-sm capitalize text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
                          settings.aiPersonality === p &&
                            'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        )}
                        onClick={() => {
                          saveSettings({ aiPersonality: p });
                          setAiMenuOpen(false);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {settings.aiChatEnabled && settings.aiMode === 'auto' && (
              <AIChatBanner
                personality={settings.aiPersonality}
                onDisable={() => setAiMode('suggest')}
              />
            )}

            {searchOpen && (
              <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages... (Esc to close)"
                  className="input-base"
                  autoFocus
                />
                {searchQuery.trim() && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {filteredMessages.length} match
                    {filteredMessages.length === 1 ? '' : 'es'}
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {displayMessages.map((msg, idx) => {
                const fromSelf = msg.senderId === currentUser.id;
                const prev = displayMessages[idx - 1];
                const showAvatar = !fromSelf && (!prev || prev.senderId !== msg.senderId);
                const highlight =
                  searchQuery.trim() &&
                  msg.type === 'text' &&
                  msg.content.toLowerCase().includes(searchQuery.toLowerCase());

                return (
                  <div
                    key={msg.id}
                    className={
                      highlight
                        ? 'rounded-xl bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800'
                        : ''
                    }
                  >
                    <MessageBubble
                      message={msg}
                      fromSelf={fromSelf}
                      friend={friend}
                      showAvatar={showAvatar}
                      onReact={toggleReaction}
                    />
                  </div>
                );
              })}

              {aiLoading && <TypingIndicator />}

              {suggestions.length > 0 && settings.aiMode !== 'off' && (
                <AISuggestionChips
                  suggestions={suggestions}
                  onSelect={(text) => setDraft(text)}
                />
              )}

              {!aiLoading &&
                suggestions.length === 0 &&
                lastFromFriend &&
                settings.aiMode === 'suggest' && (
                  <div className="mt-2 flex justify-center">
                    <Button size="sm" variant="outline" onClick={handleManualSuggest}>
                      ✨ Get AI reply suggestions
                    </Button>
                  </div>
                )}

              <div ref={bottomRef} />
            </div>

            <MessageInput onSend={handleSend} disabled={false} initialText={draft} />
          </>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatPageContent />
    </RequireAuth>
  );
}
