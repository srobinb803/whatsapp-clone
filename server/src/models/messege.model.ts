import {Schema, model, Document} from 'mongoose';

export interface IWebhook extends Document {
    payload_id: string;
    wa_id?: string;
    message_id?: string;
    status?: 'delivered' | 'read' | 'sent' | 'failed';
    payload_type: string;
    metaData?: Record<string, any>;
    createdAt?: Date;
    isUserMessage?: boolean;
}

const WebhookSchema = new Schema<IWebhook>({
    payload_id: {type: String, required: true, unique: true},
    wa_id: {type: String,  index: true},
    message_id: {type: String, sparse: true},    
    status: {type: String, enum: ['sent', 'delivered', 'read', 'received', 'failed']},
    payload_type: {type: String, required: true},
    metaData: {type: Schema.Types.Mixed, required: false},
    createdAt: {type: Date, required: true, default: Date.now},
    isUserMessage: {type: Boolean, default: false}
}, {
    timestamps: true,
});

export const Webhook = model<IWebhook>('processed_payloads', WebhookSchema);