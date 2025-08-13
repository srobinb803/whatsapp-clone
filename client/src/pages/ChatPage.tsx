import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { ChatWindow } from '../components/layout/ChatWindow';
import { getConversations, getMessagesByWaId, sendMessage } from '../api';
import type { IConversation, IClientMessage } from '../types';
import { useSocketEvents } from '../hooks/useSocketHook';
import { socket } from '@/api/socket';
import { ModeToggle } from '@/common/ThemeToggle';

export const ChatPage = () => {
  // --- STATE MANAGEMENT ---
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IClientMessage[]>([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const convos = await getConversations();
        setConversations(convos);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsConversationsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const msgs = await getMessagesByWaId(selectedConversation.wa_id);
        setMessages(msgs);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // --- REAL-TIME EVENT HANDLERS ---
  const handleNewMessage = useCallback((data: { wa_id: string; message: IClientMessage }) => {
    const receivedMessage = {
      ...data.message,
      timestamp: new Date(data.message.timestamp), 
    };

    if (data.wa_id === selectedConversation?.wa_id) {
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    setConversations(prevConversations => {
      const convoIndex = prevConversations.findIndex(c => c.wa_id === data.wa_id);

      // CASE 1: The conversation already exists.
      if (convoIndex !== -1) {
        const updatedConvo = {
          ...prevConversations[convoIndex],
          lastMessage: receivedMessage.text,
          lastMessageTimestamp: receivedMessage.timestamp.toISOString(),
        };
        const filteredConversations = prevConversations.filter(c => c.wa_id !== data.wa_id);
        return [updatedConvo, ...filteredConversations];
      }

      // CASE 2: This is a new conversation.
      else {
        socket.emit('contact:getDetails', data.wa_id);

        //  Create the new conversation with a placeholder name for now.
        const newConvo: IConversation = {
          wa_id: data.wa_id,
          name: 'Loading...', // Using  loading placeholder
          lastMessage: receivedMessage.text,
          lastMessageTimestamp: receivedMessage.timestamp.toISOString(),
        };
        return [newConvo, ...prevConversations];
      }
    });
  }, [selectedConversation]);

  const handleStatusUpdate = useCallback((data: { wa_id: string; message_id: string; status: 'sent' | 'delivered' | 'read' | 'failed' }) => {
    if (data.wa_id === selectedConversation?.wa_id) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.message_id ? { ...msg, status: data.status } : msg
        )
      );
    }
  }, [selectedConversation]);

  const handleContactDetails = useCallback((data: { wa_id: string; name: string }) => {
    setConversations(prevConversations =>
      prevConversations.map(convo =>
        convo.wa_id === data.wa_id ? { ...convo, name: data.name } : convo
      )
    );
  }, []);

  useSocketEvents({ handleNewMessage, handleStatusUpdate, handleContactDetails });

  // --- UI ACTION HANDLERS ---
  const handleConversationSelect = (wa_id: string) => {
    const conversation = conversations.find(c => c.wa_id === wa_id) || null;
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim()) return;

    try {
      await sendMessage(selectedConversation.wa_id, text, selectedConversation.name);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // --- RENDER LOGIC ---
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div
        className={`
          h-full w-full flex flex-col border-r bg-card
          ${selectedConversation ? 'hidden md:flex' : 'flex'}
          md:w-1/3 md:max-w-sm
        `}
      >
        {/* The Sidebar component itself no longer needs height/overflow classes */}
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversation?.wa_id || null}
          onConversationSelect={handleConversationSelect}
        />
      </div>
      <div className={`h-full w-full flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'} md:flex-1`}>
        {selectedConversation ? (
          <ChatWindow
            contactName={selectedConversation.name}
            contactPhone={selectedConversation.wa_id}
            messages={messages}
            isLoading={isMessagesLoading}
            onSendMessage={handleSendMessage}
            onBackClick={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};