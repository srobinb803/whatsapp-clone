import { ChatListItem } from './ChatList';
import type { IConversation } from '../../types';
import { SidebarHeader } from './SidebarHeader';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';

interface SidebarProps {
  conversations: IConversation[];
  onConversationSelect: (wa_id: string) => void;
  selectedConversationId: string | null;
}



export const Sidebar = ({ conversations, onConversationSelect, selectedConversationId }: SidebarProps) => {
  if (!Array.isArray(conversations)) {
    return <div className="p-4 text-red-500">Error: Invalid conversation data.</div>;
  }

   const [searchQuery, setSearchQuery] = useState('');

 const filteredConversations = conversations.filter(convo => 
    convo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 return (
    <div className="flex flex-col h-full bg-card">
      <SidebarHeader />
      
      {/* Search Bar */}
      <div className="p-2 bg-card border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search or start new chat" className="pl-10 bg-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
             />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((convo) => (
          <ChatListItem
            key={convo.wa_id}
            name={convo.name}
            lastMessage={convo.lastMessage}
            lastMessageTimestamp={convo.lastMessageTimestamp}
            isSelected={convo.wa_id === selectedConversationId}
            onClick={() => onConversationSelect(convo.wa_id)}
          />
        ))}
      </div>
    </div>
  );
};