import express from 'express';
import { authHandler } from '../middlewares/authHandlers.js';
import { requireRole } from '../middlewares/requireRole.js';
import { grantRole, revokeRole } from '../services/roleService.js';

const router = express.Router();

router.post('/:userId/roles/:roleName',
    authHandler, requireRole('admin'),
    async (req, res, next) => {
        try {
            await grantRole(req.params.userId, req.params.roleName);
            res.json({ message: 'Granted' });
        } catch (e) { next(e); }
    });

router.delete('/:userId/roles/:roleName',
    authHandler, requireRole('admin'),
    async (req, res, next) => {
        try {
            await revokeRole(req.params.userId, req.params.roleName);
            res.json({ message: 'Revoked' });
        } catch (e) { next(e); }
    });

export default router;
