import express from 'express'
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandlers.js';

const app = express();

app.use(express.json())
app.use('/api/auth', authRoutes)
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () =>
    console.log(`Server: http://localhost:${process.env.PORT}`)
);