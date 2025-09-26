// src/validation/roomSchemas.js
import { z } from 'zod';

const nameRule = z.string().trim().min(1, 'name là bắt buộc');
const capacityRule = z
    .union([z.number(), z.string()])
    .optional()
    .transform(v => (v === undefined || v === '' ? undefined : Number(v)))
    .refine(v => v === undefined || Number.isInteger(v), 'capacity phải là số nguyên')
    .refine(v => v === undefined || v >= 0, 'capacity phải ≥ 0');

/** 1) Tạo phòng */
export const createRoomSchema = z.object({
    name: nameRule,
    capacity: capacityRule,
});

/** 2) Cập nhật phòng */
export const updateRoomSchema = z.object({
    name: nameRule.optional(),
    capacity: capacityRule, 
}).refine(
    data => Object.keys(data).length > 0,
    { message: 'Không có trường nào để cập nhật' }
);

/** 3) Query list: filter + sort + pagination */
export const listRoomsQuerySchema = z.object({
    q: z.string().trim().optional(),                    // tìm theo tên
    min_capacity: z.string().optional()
        .transform(v => (v ? Number(v) : undefined))
        .refine(v => v === undefined || (Number.isInteger(v) && v >= 0), 'min_capacity không hợp lệ'),
    page: z.string().optional()
        .transform(v => (v ? Number(v) : 1))
        .refine(n => Number.isInteger(n) && n > 0, 'page phải là số nguyên > 0'),
    page_size: z.string().optional()
        .transform(v => (v ? Number(v) : 20))
        .refine(n => Number.isInteger(n) && n > 0 && n <= 100, 'page_size 1..100'),
    sort_by: z.enum(['id', 'name', 'capacity', 'createdAt']).optional().default('id'),
    sort_dir: z.enum(['asc', 'desc']).optional().default('asc'),
});

/** 4) Path param :id */
export const roomIdParamSchema = z.object({
    id: z.string()
        .transform(v => Number(v))
        .refine(n => Number.isInteger(n) && n > 0, 'id không hợp lệ'),
});
