import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, activeFriendId, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-400 dark:text-slate-500">
        You have no friends yet — go to People to connect
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((c) => (
        <ConversationItem
          key={c.friendId}
          conversation={c}
          active={String(c.friendId) === String(activeFriendId || '')}
          onClick={() => onSelect(c.friendId)}
        />
      ))}
    </div>
  );
}
