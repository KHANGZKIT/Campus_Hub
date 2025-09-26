import asyncHandler from 'express-async-handler';
import { prisma } from '../db/client.js';
import { BookingStatus } from '@prisma/client';

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
    const { room_id, starts_at, ends_at } = req.body; // FE gửi string

    // ép kiểu nhẹ nhàng
    const roomId = Number(room_id);
    if (!Number.isFinite(roomId)) {
        return res.status(400).json({ message: 'room_id must be a number' });
    }
    if (!starts_at || !ends_at) {
        return res.status(400).json({ message: 'starts_at and ends_at are required' });
    }

    const startsAt = new Date(starts_at);
    const endsAt = new Date(ends_at);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        return res.status(400).json({ message: 'starts_at/ends_at must be valid ISO datetime strings' });
    }
    if (endsAt <= startsAt) {
        return res.status(400).json({ message: 'ends_at must be after starts_at' });
    }

    // 1) phòng tồn tại?
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, name: true, capacity: true },
    });
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

    // 2) chặn trùng lịch (overlap)
    const overlap = await prisma.booking.findFirst({
        where: {
            roomId,
            status: { in: ['approved', 'pending'] },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
        },
        select: { id: true },
    });
    if (overlap) return res.status(409).json({ message: 'Phòng đã có lịch trong khoảng này' });

    // 3) tạo booking
    const booking = await prisma.booking.create({
        data: {
            roomId,
            userId: req.userId,
            startsAt,
            endsAt,
            status: 'approved',
        },
    });

    return res.status(201).json(booking);
});


// GET /api/bookings/my
export const listMyBookings = asyncHandler(async (req, res) => {
    const items = await prisma.booking.findMany({
        where: { userId: req.userId },
        orderBy: { startsAt: 'asc' },
        include: { room: { select: { id: true, name: true, capacity: true } } },
    });
    return res.json(items);
});

// PATCH /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;      // UUID string
    const userId = req.userId;

    const bk = await prisma.booking.findUnique({
        where: { id },
        select: { id: true, userId: true, status: true },
    });

    if (!bk) return res.status(404).json({ message: 'Booking không tồn tại' });
    if (bk.userId !== userId) return res.status(403).json({ message: 'Không có quyền hủy' });
    if (bk.status === BookingStatus.cancelled) {
        return res.status(400).json({ message: 'Booking đã hủy trước đó' });
    }

    const result = await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.cancelled },
        select: { id: true, status: true },
    });

    return res.json(result);
});
