// src/controllers/roomController.js
import asyncHandler from 'express-async-handler';
import { prisma } from '../db/client.js';

/**
 * GET /api/rooms
 * Query (đã validate & transform bởi listRoomsQuerySchema):
 *  - q?: string
 *  - min_capacity?: number
 *  - page: number  (default schema)
 *  - page_size: number
 *  - sort_by: 'id'|'name'|'capacity'|'createdAt'
 *  - sort_dir: 'asc'|'desc'
 */
export const listRooms = asyncHandler(async (req, res) => {
  const {
    q,
    min_capacity,          // có thể là "30" (string)
    page = 1,
    page_size = 20,
    sort_by = 'id',
    sort_dir = 'asc',
  } = req.query;

  const minCap =
    min_capacity !== undefined && String(min_capacity).trim() !== ''
      ? Number(min_capacity)
      : undefined;

  if (minCap !== undefined && Number.isNaN(minCap)) {
    return res.status(400).json({ message: 'min_capacity must be a number' });
  }

  const pageN = Number(page) || 1;
  const pageSizeN = Number(page_size) || 20;

  const where = {
    AND: [
      q ? { name: { contains: String(q), mode: 'insensitive' } } : {},
      minCap !== undefined ? { capacity: { gte: minCap } } : {},
    ],
  };

  const orderBy = { [sort_by]: sort_dir };
  const skip = (pageN - 1) * pageSizeN;
  const take = pageSizeN;

  const [items, total] = await Promise.all([
    prisma.room.findMany({ where, orderBy, skip, take }),
    prisma.room.count({ where }),
  ]);

  return res.json({ items, total, page: pageN, page_size: pageSizeN });
});


/**
 * GET /api/rooms/:id
 * Params (đã validate bởi roomIdParamSchema): { id: number }
 */
export const getRoom = asyncHandler(async (req, res) => {
  const id = Number(req.params.id); // đã là number sau validateParams
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  return res.json(room);
});

/**
 * POST /api/rooms
 * Body (đã validate bởi createRoomSchema): { name: string, capacity?: number }
 */
export const createRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  try {
    const room = await prisma.room.create({ data: { name, capacity } });
    return res.status(201).json(room);
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(409).json({ message: 'Tên phòng đã tồn tại' });
    }
    throw e;
  }
});

/**
 * PATCH /api/rooms/:id
 * Params: { id: number } (validate)
 * Body  : { name?: string, capacity?: number } (validate)
 */
export const updateRoom = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, capacity } = req.body;

  try {
    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(capacity !== undefined && { capacity }),
      },
    });
    return res.json(room);
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(409).json({ message: 'Tên phòng đã tồn tại' });
    }
    if (e?.code === 'P2025') {
      return res.status(404).json({ message: 'Room not found' });
    }
    throw e;
  }
});

/**
 * DELETE /api/rooms/:id
 * Params: { id: number } (validate)
 */
export const deleteRoom = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.room.delete({ where: { id } });
    return res.json({ message: 'Room deleted' });
  } catch (e) {
    if (e?.code === 'P2025') {
      return res.status(404).json({ message: 'Room not found' });
    }
    throw e;
  }
});
