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
  } = useChat(currentUser.id, friendId || null);
  const {
    settings,
    saveSettings,
    suggestChatReplies,
    generateAutoReply,
    loading: aiLoading,
    error: aiError,
    setError: setAiError,
  } = useAI(currentUser.id);

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [draft, setDraft] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const bottomRef = useRef(null);
  const lastHandledMsgId = useRef(null);
  const autoReplyTimer = useRef(null);

  const friend = friendId
    ? storage.getUsers().find((u) => u.id === friendId)
    : null;

  // Redirect if not friends
  useEffect(() => {
    if (!friendId) return;
    if (!areFriends(currentUser.id, friendId)) {
      navigate('/friends', { state: { message: 'You can only chat with friends.' } });
    }
  }, [friendId, currentUser.id, navigate]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, aiLoading]);

  // Mode 1 suggestions + Mode 2 auto-reply when friend sends a new message
  useEffect(() => {
    if (!friendId || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.senderId === currentUser.id) {
      setSuggestions([]);
      return;
    }
    if (lastHandledMsgId.current === last.id) return;
    lastHandledMsgId.current = last.id;

    const recent = messages.slice(-5).map((m) => ({
      ...m,
      fromSelf: m.senderId === currentUser.id,
    }));

    const mode = settings.aiMode || 'suggest';

    if (mode === 'off') {
      setSuggestions([]);
      return;
    }

    if (mode === 'auto' && settings.aiChatEnabled) {
      setSuggestions([]);
      if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = setTimeout(async () => {
        const reply = await generateAutoReply({
          userName: currentUser.name,
          friendName: friend?.name || 'Friend',
          recentMessages: recent,
        });
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
      }, 1500);
      return () => {
        if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      };
    }

    // Mode 1 — suggest only
    let cancelled = false;
    (async () => {
      const chips = await suggestChatReplies({
        userName: currentUser.name,
        friendName: friend?.name || 'Friend',
        recentMessages: recent,
      });
      if (!cancelled) setSuggestions(chips);
    })();

    return () => {
      cancelled = true;
      if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
    };
  }, [
    messages,
    friendId,
    currentUser.id,
    currentUser.name,
    friend?.name,
    settings.aiMode,
    settings.aiChatEnabled,
    generateAutoReply,
    suggestChatReplies,
    sendMessage,
  ]);

  useEffect(() => {
    if (aiError) {
      setToast(aiError);
      setAiError('');
    }
  }, [aiError, setAiError]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
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
    try {
      sendMessage({ receiverId: friendId, type, content, aiGenerated: false });
      setSuggestions([]);
      setDraft('');
    } catch (err) {
      setToast(err.message);
    }
  }

  function setAiMode(mode) {
    saveSettings({
      aiMode: mode,
      aiChatEnabled: mode === 'auto',
    });
    setAiMenuOpen(false);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Conversation list */}
      <aside
        className={clsx(
          'w-full border-r border-slate-200 dark:border-slate-800 md:w-80 md:block',
          friendId ? 'hidden' : 'block'
        )}
      >
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Chat</h1>
          <Link to="/friends" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
            Friends
          </Link>
        </div>
        <ConversationList
          conversations={conversations}
          activeFriendId={friendId}
          onSelect={(id) => navigate(`/chat/${id}`)}
        />
      </aside>

      {/* Conversation panel */}
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
                      {settings.aiChatEnabled && settings.aiMode === 'auto'
                        ? ` · AI (${settings.aiPersonality})`
                        : ''}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="relative flex items-center gap-2">
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
                  className="rounded-lg px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950"
                >
                  AI ▾
                </button>
                {aiMenuOpen && (
                  <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
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

              {aiLoading && settings.aiMode === 'auto' && <TypingIndicator />}

              {suggestions.length > 0 && settings.aiMode !== 'off' && (
                <AISuggestionChips
                  suggestions={suggestions}
                  onSelect={(text) => setDraft(text)}
                />
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
