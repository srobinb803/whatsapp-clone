import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { processWebhookPayload } from '../services/message.service.js';
import { type IBasePayload } from '../types/whatsapp.types.js';

/**
  * The actual Express request handler.
  * It receives the request, validates the payload, passes it to the service,
  * and sends an appropriate HTTP response.
  */

export const handleWebhook = (io: SocketIOServer) => async (req: express.Request, res: express.Response): Promise<void> => {
    const payload = req.body as IBasePayload;

    try {
        if (!payload) {
            console.warn('Received a malformed or non-WhatsApp webhook payload.');
            res.status(400).json({ status: 'error', message: 'Invalid payload structure.' });
            return;
        }
        console.log(`[Webhook Controller] Received payload ID: ${payload._id}`);
        
        await processWebhookPayload(payload, io);
        res.status(200).json({ status: 'success', message: 'Payload processed successfully.' });
    }catch (error) {
        console.error(`[Webhook Controller] Error processing payload: ${(error as Error).message}`);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
}