import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './Message';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import type { IClientMessage } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatWindowProps {
  contactName: string;
  contactPhone: string;
  messages: IClientMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onBackClick: () => void;
}

export const ChatWindow = ({ contactName, contactPhone, messages, isLoading, onSendMessage, onBackClick }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = (typeof contactName === 'string' && contactName) ? contactName : 'Unknown Contact';
  const initial = displayName.charAt(0).toUpperCase();

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage(''); 
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Chat Header */}
      <div className="flex items-center p-2 md:p-4 bg-background border-b shadow-sm">
        <Button onClick={onBackClick} variant="ghost" size="icon" className="md:hidden mr-2">
          <ArrowLeft />
        </Button>
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${displayName}`} alt={displayName} />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">{contactName}</h3>
          <p className="text-xs text-muted-foreground leading-tight">{contactPhone}</p>
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
            {messages.map((msg) => (
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
      </div>

      {/* Message Input Form */}
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};