// src/middlewares/normalizeBookingKeys.js
export function normalizeBookingKeys(req, _res, next) {
    const b = req.body || {};
    if (b.roomId !== undefined && req.body.room_id === undefined) req.body.room_id = b.roomId;
    if (b.startsAt !== undefined && req.body.starts_at === undefined) req.body.starts_at = b.startsAt;
    if (b.endsAt !== undefined && req.body.ends_at === undefined) req.body.ends_at = b.endsAt;
    next();
}
