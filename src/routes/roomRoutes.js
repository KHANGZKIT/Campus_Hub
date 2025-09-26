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

const router = express.Router();

// router.post('/', authGuard, requireRole('admin','staff'), validate(createRoomSchema), createRoom);
router.post('/', validate(createRoomSchema), createRoom);
router.get('/', validateQuery(listRoomsQuerySchema), listRooms);
router.get('/:id', validateParams(roomIdParamSchema), getRoom);
router.patch('/:id', validateParams(roomIdParamSchema), validate(updateRoomSchema), updateRoom);
router.delete('/:id', validateParams(roomIdParamSchema), deleteRoom);

export default router;
