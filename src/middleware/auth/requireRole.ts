import { Request, Response, NextFunction } from 'express';
import { AnyRole, PlatformRole } from '../../types/roles.js';

interface RequireRoleOptions {
  allowedRoles: AnyRole[];
  allowSuperadmin?: boolean;
}

/**
 * Accept either:
 *  • an array of roles, e.g. requireRole([R.Owner, R.Manager])
 *  • an options object, e.g. requireRole({ allowedRoles: [R.Owner], allowSuperadmin: true })
 */
export function requireRole(
  opts: AnyRole[] | RequireRoleOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const { allowedRoles, allowSuperadmin } = Array.isArray(opts)
    ? { allowedRoles: opts, allowSuperadmin: false }
    : opts;

  const normalizedAllowed = allowedRoles.map(r => r.toString().trim().toLowerCase());

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user || !user.role) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const incoming = user.role.trim().toLowerCase();

    // Allow Superadmin override
    if (allowSuperadmin && incoming === PlatformRole.Superadmin) {
      next();
      return;
    }

    // Check if the role is allowed
    if (!normalizedAllowed.includes(incoming)) {
      res.status(403).json({ message: 'Forbidden: role not allowed' });
      return;
    }

    // If this is a restaurant-level role, enforce restaurant context exists
    const isTenantRole = incoming !== PlatformRole.Superadmin.toLowerCase();
    if (isTenantRole && !user.restaurant) {
      res.status(403).json({ message: 'Forbidden: missing restaurant context' });
      return;
    }

    next();
  };
}
