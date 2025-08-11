import {Schema, model, Document} from 'mongoose';

export interface IWebhook extends Document {
    payload_id: string;
    wa_id?: string;
    message_id?: string;
    statue?: 'delivered' | 'read' | 'sent' | 'failed';
    payload_type: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    isUserMessage?: boolean;
}

const WebhookSchema = new Schema<IWebhook>({
    payload_id: {type: String, required: true, unique: true},
    wa_id: {type: String,  index: true},
    message_id: {type: String, sparse: true},    
    statue: {type: String, enum: ['delivered', 'read', 'sent', 'failed']},
    payload_type: {type: String, required: true},
    metadata: {type: Schema.Types.Mixed, required: false},
    createdAt: {type: Date, required: true, default: Date.now},
    isUserMessage: {type: Boolean, default: false}
}, {
    timestamps: true,
});

export const Webhook = model<IWebhook>('processed_payloads', WebhookSchema);