import { ChatListItem } from './ChatList';
import type { IConversation } from '../../types';

interface SidebarProps {
  conversations: IConversation[];
  onConversationSelect: (wa_id: string) => void;
  selectedConversationId: string | null;
}

export const Sidebar = ({ conversations, onConversationSelect, selectedConversationId }: SidebarProps) => {
  if (!Array.isArray(conversations)) {
    return <div className="p-4 text-red-500">Error: Invalid conversation data.</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto p-2 space-y-1">
      {conversations.length === 0 ? (
        <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
      ) : (
        conversations.map((convo) => {
          if (!convo || typeof convo.wa_id !== 'string') {
            return null;
          }
          return (
            <ChatListItem
              key={convo.wa_id}
              name={convo.name}
              lastMessage={convo.lastMessage}
              lastMessageTimestamp={convo.lastMessageTimestamp}
              isSelected={convo.wa_id === selectedConversationId}
              onClick={() => onConversationSelect(convo.wa_id)}
            />
          );
        })
      )}
    </div>
  );
};