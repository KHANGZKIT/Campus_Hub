import express from 'express';
import { validate, validateParams, validateQuery } from '../middlewares/validate.js';
import {
    createRoomSchema,
    updateRoomSchema,
    listRoomsQuerySchema,
    roomIdParamSchema,
} from '../validation/roomSchemas.js';
import {
    createRoom,
    listRooms,
    getRoom,
    updateRoom,
    deleteRoom,
} from '../controllers/roomController.js';
import { requireRole } from '../middlewares/authHandlers.js';

const router = express.Router();

// router.post('/', authGuard, requireRole('admin','staff'), validate(createRoomSchema), createRoom);
router.post('/', requireRole('admin', 'staff'), validate(createRoomSchema), createRoom);
router.get('/', validateQuery(listRoomsQuerySchema), listRooms);
router.get('/:id', requireRole('admin', 'staff'), validateParams(roomIdParamSchema), getRoom);
router.patch('/:id', requireRole('admin', 'staff'), validateParams(roomIdParamSchema), validate(updateRoomSchema), updateRoom);
router.delete('/:id', requireRole('admin', 'staff'), validateParams(roomIdParamSchema), deleteRoom);

export default router;
