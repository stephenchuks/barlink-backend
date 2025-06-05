import { PlatformRole } from '../../types/roles.js';
/**
 * Accept either:
 *  • an array of roles, e.g. requireRole([R.Owner, R.Manager])
 *  • an options object, e.g. requireRole({ allowedRoles: [R.Owner], allowSuperadmin: true })
 */
export function requireRole(opts) {
    const { allowedRoles, allowSuperadmin } = Array.isArray(opts)
        ? { allowedRoles: opts, allowSuperadmin: false }
        : opts;
    const normalizedAllowed = allowedRoles.map(r => r.toString().trim().toLowerCase());
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            res.status(401).json({ message: 'Unauthenticated' });
            return;
        }
        const incoming = user.role.trim().toLowerCase();
        // Superadmin bypass
        if (allowSuperadmin && incoming === PlatformRole.Superadmin) {
            next();
            return;
        }
        // Allowed restaurant roles
        if (normalizedAllowed.includes(incoming)) {
            next();
            return;
        }
        // If we fall through, it’s forbidden
        res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        return;
    };
}
