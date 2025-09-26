import express from 'express'
import { register, login, me } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validation/authSchemas.js';
import { authHandler } from '../middlewares/authHandlers.js';

const router = express.Router()

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authHandler, me);

export default router