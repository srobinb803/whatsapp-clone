import type { IWebhook } from "../models/messege.model.js";
import { isMessagePayload } from "../types/whatsapp.types.js";

export interface IClientMessage {
    id: string;
    text: string;
    timestamp: Date | string;
    status: 'delivered' | 'read' | 'sent' | 'failed';
    isUserMessage: boolean;
}

export const formatMessageForClient = (doc: IWebhook): IClientMessage | null => {
    // Check if the document is a user message from ui
    if (doc.isUserMessage) {

        const metaData = doc.metaData as { text: string };

        return {
            id: doc.message_id as string,
            text: metaData.text,
            timestamp: doc.createdAt?.toISOString() || new Date().toISOString(),
            status: doc.status as IClientMessage['status'],
            isUserMessage: true,

        }
    }

    // Check if the document is a message from webhook
    if (doc.metaData?.entry?.[0]?.changes?.[0]?.value) {
        const { value } = doc.metaData.entry[0].changes[0];

        if (isMessagePayload(value) && value.messages[0]) {
            const messageData = value.messages[0];
            return {
                id: messageData.id,
                text: messageData.text.body,
                timestamp: new Date(parseInt(messageData.timestamp, 10) * 1000),
                status: doc.status as IClientMessage['status'],
                isUserMessage: false,
            };
        }
    }

    return null;
}