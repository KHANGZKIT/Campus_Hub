import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import { hashPassword, comparePassword } from '../utils/passwords.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Đăng ký
export const register = asyncHandler(async (req, res) => {
    try {
        const { email, password, fullName } = req.validated.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are mandatory' });
        }

        // email đã tồn tại?
        const existed = await prisma.user.findUnique({ where: { email } });
        if (existed) return res.status(409).json({ message: 'Email đã tồn tại' });

        //Tao User
        const passwordHash = await hashPassword(password)
        const user = await prisma.user.create({
            data: { email, passwordHash, fullName },
            select: { id: true, email: true },
        });

        // Mặc định gán role student
        const student = await prisma.role.findUnique({
            where: { name: 'student' }
        });
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: student.id } },
            update: {},
            create: {
                user: { connect: { id: user.id } },
                role: { connect: { id: student.id } }
            }
        });

        //Tra ve Token
        const token = jwt.sign({ sub: user.id }, JWT_SECRET, {
            algorithm: 'HS256',
            expiresIn: '7d',
        });
        res.status(201).json({ id: user.id, email: user.email, token });

    } catch (error) {
        console.error(error);
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

// Lấy thông tin user hiện tại
export const me = asyncHandler(async (req, res) => {
    // Lấy token như cũ
    const h = req.get('authorization') || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Missing token' });

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET); // { sub: '<userId>', ... }
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
    const sub = typeof payload?.sub === 'string' ? payload.sub : null;
    if (!sub) return res.status(401).json({ message: 'Invalid token subject' });

    // 👇 Lấy user + roles qua bảng nối
    const user = await prisma.user.findUnique({
        where: { id: sub },
        select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
            roles: {
                include: { role: true }
            }, // <- join
        },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Map về mảng tên role gọn gàng cho FE
    const roles = user.roles.map(ur => ur.role.name);

    return res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        roles, // ví dụ: ["student"] hoặc ["staff","student"]
    });
});

