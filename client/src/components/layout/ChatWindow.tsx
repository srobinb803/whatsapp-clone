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
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Scroll to bottom on new messages or when input focus changes
  useEffect(() => {
    if (!isSearching) {
      // Use timeout to ensure scroll happens after DOM update
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages, isSearching, isInputFocused]);

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
    <div className="flex flex-col h-[100dvh] bg-background">
      <div className="sticky top-0 z-10 flex items-center p-3 bg-card border-b">
        <Button onClick={onBackClick} variant="ghost" size="icon" className="md:hidden mr-2">
          <ArrowLeft />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${contactName}`} alt={contactName} />
          <AvatarFallback>{contactName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
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
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Sticky Input Area */}
      <div className="sticky bottom-0 p-3 bg-card border-t">
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
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            autoComplete="off"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full bg-ring hover:bg-ring/90"
      
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};