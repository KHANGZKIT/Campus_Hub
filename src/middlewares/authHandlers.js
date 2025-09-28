// src/middlewares/authGuard.js
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import config from '../config/env.js';

export async function authHandler(req, res, next) {
    try {

        const auth = req.headers.authorization || '';
        if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });

        const token = auth.slice(7);
        const secret = (config.jwtSecret || '').trim(); // tránh khoảng trắng .env

        let payload;
        try {
            payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
        } catch (e) {
            console.log('[JWT][FAIL] name=%s msg=%s', e.name, e.message);
            return res.status(401).json({ message: e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
        }

        req.userId = payload.sub;

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, fullName: true, createdAt: true },
        });
        if (!user) {
            return res.status(401).json({ code: 'AUTH_USER_NOT_FOUND', message: 'User not found for this token' });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}
