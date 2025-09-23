export function errorHandler(err, _req, res, _next) {
    console.error(err);
    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status).json({ message: err?.message || 'Internal Server Error' });
}