import express from 'express'
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import { errorHandler } from './middlewares/errorHandlers.js';
import env from './config/env.js';
import bookingRoutes from './routes/bookingRoutes.js';
import cors from 'cors';
import adminUsers from './routes/adminUsers.js';

const app = express();

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: false
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUsers);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));


app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);


app.listen(env.port || 5000, () =>
    console.log(`Server: http://localhost:${process.env.PORT}`)
);