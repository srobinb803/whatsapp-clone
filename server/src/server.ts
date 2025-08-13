import express, { type Express } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import connectDB from './config/db.js';
import { Webhook } from './models/messege.model.js';
import { Server } from 'socket.io';
import { handleWebhook } from './api/webhook.controller.js';
import { getConversations, getMessagesByWaId, createUserMessage } from './api/message.controller.js';

dotenv.config();

export const app: Express = express();
export const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Webhook endpoint for simulating WhatsApp messages
app.post('/api/webhook/', handleWebhook(io));

// API endpoints for list of conversations 
app.get('/api/conversations', getConversations);

// API endpoints for specific conversation 
app.get('/api/messages/:wa_id', getMessagesByWaId);

// API endpoint for handling message sent from ui
app.post('/api/messages', createUserMessage(io));

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('contact:getDetails', async (wa_id: string, callback) => {
    try {
      console.log(`[Socket] Received request for contact details for: ${wa_id}`);
      
      // Find the most recent message from this contact to get their name.
      const contactDoc = await Webhook.findOne(
        { wa_id: wa_id, 'metaData.entry.0.changes.0.value.contacts.0.profile.name': { $exists: true } },
        {},
        { sort: { createdAt: -1 } }
      ).lean();

      if (contactDoc) {
        const name = contactDoc.metaData?.entry[0].changes[0].value.contacts[0].profile.name;
        console.log(`[Socket] Found name: ${name}. Sending details back.`);
        // Emit an event back to ALL clients with the details
        io.emit('contact:details', { wa_id, name });
        // Optional: Use the callback to acknowledge to the specific requester
        if (callback) callback({ status: 'ok', name });
      } else {
        console.warn(`[Socket] Could not find details for contact: ${wa_id}`);
        if (callback) callback({ status: 'error', message: 'Contact not found' });
      }
    } catch (error) {
      console.error('[Socket] Error fetching contact details:', error);
      if (callback) callback({ status: 'error', message: 'Server error' });
    }
  });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
}

startServer();




