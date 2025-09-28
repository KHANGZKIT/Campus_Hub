export function requireRole(...allowed) {
    const allow = new Set(allowed);
    return async (req, res, next) => {
        try {
            if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
            const rows = await prisma.userRole.findMany({
                where: { userId: req.userId },
                include: { role: true },
            });
            const myRoles = rows.map(r => r.role.name);
            const ok = myRoles.some(r => allow.has(r));
            if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient role' });
            req.roles = myRoles; // tiện cho controller
            next();
        } catch (e) { next(e); }
    };
}
