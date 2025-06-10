
import { PlatformRole, RestaurantRole, AnyRole } from '../types/roles.js';

export function isPlatformRole(role: AnyRole): role is PlatformRole {
  return Object.values(PlatformRole).includes(role as PlatformRole);
}

export function isRestaurantRole(role: AnyRole): role is RestaurantRole {
  return Object.values(RestaurantRole).includes(role as RestaurantRole);
}

/**
 * Determine if the `creatorRole` is allowed to create the `targetRole`
 * across both platform and restaurant hierarchies
 */
export function canCreateRole(creatorRole: AnyRole, targetRole: AnyRole): boolean {
  const hierarchy: Partial<Record<AnyRole, RestaurantRole[]>> = {
    [PlatformRole.Superadmin]: [RestaurantRole.Owner],
    [RestaurantRole.Owner]: [RestaurantRole.Manager, RestaurantRole.Supervisor, RestaurantRole.Server],
    [RestaurantRole.Manager]: [RestaurantRole.Supervisor, RestaurantRole.Server],
  };

  const allowed = hierarchy[creatorRole];
  return Array.isArray(allowed) && allowed.includes(targetRole as RestaurantRole);
}
