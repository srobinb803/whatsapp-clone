/* eslint-disable camelcase */

export interface IBasePayload {
    _id: string;
    payload_type: 'whatsapp_webhook';
    metaData: {
        object: 'whatsapp_business_account';
        entry: IEntry[];
    };
    createdAt: string;
}

interface IEntry {
    id: string;
    changes: IChange[];
}

export interface IChange {
    field: 'messages';
    value: IValue;
}

interface IValue {
    messaging_product: 'whatsapp';
    metadata: ImetaData;
    contacts?: IContact[];
    messages?: IMessage[];
    statuses?: IStatus[];
}

interface ImetaData {
    display_phone_number: string;
    phone_number_id: string;
}

interface IContact {
    profile: {
        name: string;
    };
    wa_id: string;
}

interface IMessage {
    from: string;
    id: string;
    timestamp: string;
    text: {
        body: string;
    };
    type: 'text';
}

interface IStatus {
    id: string;
    meessage_id?: string;
    recipient_id: string;
    status: 'delivered' | 'read' | 'sent' | 'failed';
    timestamp: string;
    conversation?: {
        id: string;
        origin: {
            type: 'whatsapp';
        }
    }
}

export function isMessagePayload(value: IValue): value is {
  messaging_product: 'whatsapp';
  metadata: ImetaData;
  contacts: IContact[];
  messages: IMessage[];
} {
  return (
    value.messages !== undefined &&
    value.contacts !== undefined &&
    value.messaging_product !== undefined &&
    value.metadata !== undefined
  );
}

export function isStatusPayload(value: IValue): value is {
  messaging_product: 'whatsapp';
  metadata: ImetaData;
  statuses: IStatus[];
} {
  return (
    value.statuses !== undefined &&
    value.messaging_product !== undefined &&
    value.metadata !== undefined
  );
}
