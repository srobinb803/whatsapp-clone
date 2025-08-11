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
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
}

startServer();




