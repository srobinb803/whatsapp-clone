import type { Request, Response } from "express";
import { Webhook } from '../models/messege.model.js';
import { formatMessageForClient, type IClientMessage } from '../utils/formatter.js';
import { Server as SocketIOServer } from 'socket.io';

// Get all conversations
export const getConversations = async (res: Response): Promise<void> => {
    try {
        const conversations = await Webhook.aggregate([
            { $match: { wa_id: { $exists: true } } }, // Only consider documents with a wa_id
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$wa_id',
                    name: { $first: '$metaData.entry.0.changes.0.value.contacts.0.profile.name' },
                    lastMessageTimestamp: { $first: '$createdAt' },
                    // Get the text from the last message
                    lastMessage: { $first: '$metaData.entry.0.changes.0.value.messages.0.text.body' },
                },
            },
            {
                $project: {
                    _id: 0,
                    wa_id: '$_id',
                    name: 1,
                    lastMessageTimestamp: 1,
                    lastMessage: 1,
                },
            },
            { $sort: { lastMessageTimestamp: -1 } },
        ]);
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations', error });
    }
}

// Get all messages for a specific wa_id
export const getMessagesByWaId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wa_id } = req.params;
        const docs = await Webhook.find({ wa_id }).sort({ createdAt: 'asc' });

        //  filter out any null results
        const messages: IClientMessage[] = docs
            .map(formatMessageForClient)
            .filter((msg): msg is IClientMessage => msg !== null);

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};

// Create a user message
export const createUserMessage = (io: SocketIOServer) => async (req: Request, res: Response): Promise<void> => {
    try {
        const { wa_id, text, name } = req.body;
        const messageId = `user_${new Date().getTime()}`;
        const now = new Date();

        const newDoc = new Webhook({
            payload_id: messageId,
            wa_id,
            message_id: messageId,
            status: 'sent',
            payload_type: 'user_message',
            metaData: { text, name },
            createdAt: now,
            isUserMessage: true,
        });

        const savedDoc = await newDoc.save();

        const clientMessage = formatMessageForClient(savedDoc);

        if (clientMessage) {
            io.emit('newMessage', { wa_id: savedDoc.wa_id, message: clientMessage });
            res.status(201).json(clientMessage);
        } else {
            res.status(500).json({ message: 'Error formatting the created message' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating message', error });
    }
};