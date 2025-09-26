import { z } from 'zod';

// Ép kiểu số và ngày tháng ngay trong schema
export const createBookingSchema = z.object({
    room_id: z.coerce.number().int().positive({ message: 'room_id không hợp lệ' }),
    // FE có thể gửi ISO string → tự ép về Date
    starts_at: z.coerce.date({ message: 'starts_at sai định dạng thời gian' }),
    ends_at: z.coerce.date({ message: 'ends_at sai định dạng thời gian' }),
}).refine(({ starts_at, ends_at }) => ends_at > starts_at, {
    message: 'ends_at phải sau starts_at',
    path: ['ends_at'],
});

// Nếu booking.id là UUID (như schema Prisma: id String @default(uuid()))
export const bookingIdParamSchema = z.object({
    id: z.string().uuid({ message: 'booking id không hợp lệ' }),
});
