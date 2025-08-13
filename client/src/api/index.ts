import axios from 'axios';
import type { IConversation, IClientMessage, IRawConversationDoc } from '@/types';

const apiClient = axios.create({
 baseURL: import.meta.env.PROD ? '/api' : import.meta.env.VITE_API_URL,
});

export const getConversations = async (): Promise<IConversation[]> => {

  const response = await apiClient.get<IRawConversationDoc[]>('/conversations');
  const rawDocs = response.data;

  return rawDocs.map((doc: IRawConversationDoc): IConversation => {

    const name = (doc.isUserMessage
        ? doc.metaData?.name
        : doc.metaData?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name
    ) ?? 'Unknown Contact'; 

    const lastMessage = (doc.isUserMessage
        ? doc.metaData?.text
        : doc.metaData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
    ) ?? '...'; 

    return {
      wa_id: doc.wa_id,
      name: name,
      lastMessage: lastMessage,
      lastMessageTimestamp: doc.createdAt,
    };
  });
};

/**
 * Fetches the full message history for a given conversation.
 */
export const getMessagesByWaId = async (wa_id: string): Promise<IClientMessage[]> => {
  type RawClientMessage = Omit<IClientMessage, 'timestamp'> & { timestamp: string };
  
  const response = await apiClient.get<RawClientMessage[]>(`/messages/${wa_id}`);
  
  return response.data.map((msg: RawClientMessage) => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
};

/**
 * Sends a new message from the UI to the backend.
 */
export const sendMessage = async (wa_id: string, text: string, name: string): Promise<IClientMessage> => {
    type RawClientMessage = Omit<IClientMessage, 'timestamp'> & { timestamp: string };

    const response = await apiClient.post<RawClientMessage>('/messages', { wa_id, text, name });
    
    return {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
    };
};