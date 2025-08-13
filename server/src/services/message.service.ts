import { Server as SocketIOServer } from 'socket.io';
import { Webhook } from '../models/messege.model.js';
import { type IBasePayload, isMessagePayload, isStatusPayload } from '../types/whatsapp.types.js';
import { formatMessageForClient } from '../utils/formatter.js';

export const processWebhookPayload = async (payload: IBasePayload, io: SocketIOServer): Promise<void> => {
    console.log('--- DATA AS RECEIVED BY SERVICE ---');
    console.log(`payload.metaData exists: ${!!payload.metaData}`);
    console.log(`payload.metaData.entry exists: ${!!payload.metaData?.entry}`);
    console.log(`payload.metaData.entry is an array: ${Array.isArray(payload.metaData?.entry)}`);
    console.log(`payload.metaData.entry has length: ${payload.metaData?.entry?.length}`);
    console.log('-----------------------------------');
    const change = payload.metaData?.entry?.[0]?.changes?.[0];
    console.log(`[message service] change: ${JSON.stringify(change, null, 2)}`);

    if (!change || !change.value) {
        console.warn("Received a webhook payload with invalid or missing 'changes' data. Skipping.");
        return;
    }

    const { value } = change;
    console.log("--- DEBUG: Analyzing the 'value' object ---");
    console.log(JSON.stringify(value, null, 2)); // Log the object beautifully formatted
    console.log(`'messages' exists: ${value.messages !== undefined}`);
    console.log(`'contacts' exists: ${value.contacts !== undefined}`);
    console.log(`'messaging_product' exists: ${value.messaging_product !== undefined}`);
    console.log(`'metaData' exists: ${value.metadata !== undefined}`);
    console.log("-----------------------------------------");

    // process message and update DB
    if (isMessagePayload(value)) {
        const message = value.messages?.[0];
        const contact = value.contacts?.[0];
        if (!message || !contact) {
            console.warn('Message or contact data is missing in the payload');
            return;
        }

        const newWebhook = {
            payload_id: payload._id,
            wa_id: contact.wa_id,
            message_id: message.id,
            status: 'received' as const,
            payload_type: payload.payload_type,
            metaData: payload.metaData,
            createdAt: new Date(payload.createdAt),
             isUserMessage: false,
        }

        const savedDoc = await Webhook.findOneAndUpdate(
            { payload_id: payload._id },
            newWebhook,
            { new: true, upsert: true, runValidators: true }
        )

        const formattedMessage = formatMessageForClient(savedDoc);

        if (formattedMessage) {
            io.emit('message', { wa_id: savedDoc.wa_id, message: formattedMessage });
        }

        console.log(`message from ${savedDoc.wa_id} saved successfully`);
    }

    // process status and update DB
    if (isStatusPayload(value)) {
        const status = value.statuses?.[0];
        if (!status) {
            console.warn('Status data is missing in the payload');
            return;
        }

        const existingMessage = await Webhook.findOne({ message_id: status.id }).lean();

        if (!existingMessage) {
            console.warn(`[Status Update] Received status '${status.status}' for a message that does not exist in the DB. Message ID: ${status.id}. Skipping.`);
            return;
        }

        const updatedDoc = await Webhook.findByIdAndUpdate(
            existingMessage._id,
            { $set: { status: status.status } },
            { new: true, runValidators: true }
        )

        if (updatedDoc) {
            io.emit('statusUpdate', {
                wa_id: updatedDoc.wa_id,
                message_id: updatedDoc.message_id,
                status: updatedDoc.status
            });
        }
        console.log(`status for message ${status.id} updated successfully`);
    }
}