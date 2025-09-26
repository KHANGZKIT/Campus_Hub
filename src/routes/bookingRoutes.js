import express from 'express';
import { authHandler } from '../middlewares/authHandlers.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { createBookingSchema, bookingIdParamSchema } from '../validation/bookingSchema.js';
import { createBooking, listMyBookings, cancelBooking } from '../controllers/bookingController.js';
import { normalizeBookingKeys } from '../middlewares/normalizeBookingKeys.js';


const router = express.Router();
router.use(authHandler);
router.post('/', normalizeBookingKeys, validate(createBookingSchema), createBooking);
router.get('/my', listMyBookings);
router.patch('/:id/cancel', validateParams(bookingIdParamSchema), cancelBooking);

export default router;