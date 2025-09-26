// src/middlewares/authGuard.js
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import config from '../config/env.js';
import crypto from 'node:crypto';

const sha10 = (s) => crypto.createHash('sha256').update(String(s || '')).digest('hex').slice(0, 10);

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

export function requireRole(...allowed) {
    const allow = new Set(allowed);
    return async (req, res, next) => {
        try {
            if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
            const rows = await prisma.userRole.findMany({
                where: { userId: req.userId },
                include: { role: true },
            });
            const myRoles = rows.map(r => r.role.name);
            const ok = myRoles.some(r => allow.has(r));
            if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient role' });
            req.roles = myRoles; // tiện cho controller
            next();
        } catch (e) { next(e); }
    };
}
