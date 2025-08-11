import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { Webhook } from './models/messege.model.js';

dotenv.config();

const startServer = async () => {
    await connectDB(); 
    const app = express();
    const PORT = process.env.PORT || 5000;

    app.get('/', (req, res) => {
        res.send('Server is running');
    });
    
    app.get('/api/test-db', async(req, res) => {
        try {
            const documentCount = await Webhook.countDocuments();
            res.status(200).json({ message: 'Database connection successful', count: documentCount });
        }catch (error) {
            console.error('Database connection error:', error);
            res.status(500).json({ message: 'Database connection failed', error: (error as Error).message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer()




