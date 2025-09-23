import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import { hashPassword, comparePassword } from '../utils/passwords.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Đăng ký
export const register = asyncHandler(async (req, res) => {
    const emailRaw = req.body?.email;
    const password = req.body?.password;
    const fullName = req.body?.fullName;

    if (!emailRaw || !password || !fullName) {
        return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const email = String(emailRaw).trim().toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const passwordHash = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: { email, passwordHash, fullName },
            select: { id: true, email: true }
        });
        return res.status(201).json({ _id: user.id, email: user.email });
    } catch (error) {
        if (error?.code === 'P2002') {
        
            return res.status(409).json({ message: 'Email đã tồn tại' });
        }
        throw error; 
    }
});

// Đăng nhập
export const login = asyncHandler(async (req, res) => {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ accessToken });
});

// Lấy thông tin hiện tại
export const me = asyncHandler(async (req, res) => {
    const h = req.header('authorization') || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }

    let sub;
    try {
        ({ sub } = jwt.verify(token, JWT_SECRET));
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
        where: { id: sub },
        select: { id: true, email: true, fullName: true, createdAt: true }
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
});
