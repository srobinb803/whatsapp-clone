// Matches the IClientMessage type from the backend formatter
export interface IClientMessage {
  id: string;
  text: string;
  timestamp: Date;
  status: 'delivered' | 'read' | 'sent' | 'failed';
  isUserMessage: boolean;
}

// Matches the conversation list from the backend
export interface IConversation {
  wa_id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: string;
}

export interface IRawConversationDoc {
  _id: string;
  wa_id: string;
  isUserMessage: boolean;
  createdAt: string;
  metaData: {
    // For user-sent messages
    name?: string;
    text?: string;
    // For webhook messages
    entry?: {
      changes: {
        value: {
          contacts?: {
            profile?: {
              name?: string;
            };
          }[];
          messages?: {
            text?: {
              body?: string;
            };
          }[];
        };
      }[];
    }[];
  };
}