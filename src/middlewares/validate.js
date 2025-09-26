
export const validateQuery = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid query',
            errors: parsed.error.flatten(),
        });
    }
    // ✅ KHÔNG gán lại req.query
    req.validated = req.validated || {};
    req.validated.query = parsed.data;
    next();
};

export const validateParams = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid params',
            errors: parsed.error.flatten(),
        });
    }
    req.validated = req.validated || {};
    req.validated.params = parsed.data;
    next();
};

export const validate = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid body',
            errors: parsed.error.flatten(),
        });
    }
    req.validated = req.validated || {};
    req.validated.body = parsed.data;
    next();
};
