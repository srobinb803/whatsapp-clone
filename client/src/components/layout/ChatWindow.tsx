import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './Message';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft, Send, Loader2, MoreVertical, Search, Smile, Paperclip } from 'lucide-react';
import type { IClientMessage } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ChatWindowProps {
  contactName: string;
  contactPhone: string;
  onBackClick: () => void;
  messages: IClientMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const ChatWindow = ({ contactName, contactPhone, onBackClick, messages, isLoading, onSendMessage }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
   const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Only scroll if we are not searching, to avoid jumping while typing
    if (!isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching]);

   const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <>
      {/* Chat Header */}
      <header className="flex items-center p-3 bg-card border-b flex-shrink-0">
        <Button onClick={onBackClick} variant="ghost" size="icon" className="md:hidden mr-2">
          <ArrowLeft />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${contactName}`} alt={contactName} />
          <AvatarFallback>{contactName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        {/* CONDITIONAL HEADER UI --- */}
        {isSearching ? (
          <Input 
            placeholder="Search messages..." 
            className="flex-1 bg-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight">{contactName}</h3>
            <p className="text-xs text-muted-foreground leading-tight">{contactPhone}</p>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Button onClick={() => setIsSearching(!isSearching)} variant="ghost" size="icon">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Contact info</DropdownMenuItem>
              <DropdownMenuItem>Clear chat</DropdownMenuItem>
              <DropdownMenuItem>Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto space-y-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                timestamp={msg.timestamp}
                isUserMessage={msg.isUserMessage}
                status={msg.status}
              />
            ))}
            {/* Dummy div to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* Message Input Form */}
     <footer className="p-3 bg-card border-t flex-shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-full px-4"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="rounded-full bg-ring hover:bg-ring/90">
            <Send size={20} />
          </Button>
        </form>
      </footer>
    </>
  );
};