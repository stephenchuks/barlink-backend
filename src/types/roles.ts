

/**
 * Platform‑wide roles (multi‑tenant admin)
 */
export enum PlatformRole {
  Superadmin    = 'superadmin',
  PlatformAdmin = 'platform_admin',
}

/**
 * Restaurant‑level roles (per‑tenant)
 */
export enum RestaurantRole {
  Owner      = 'owner',
  Manager    = 'manager',
  Supervisor = 'supervisor',
  Server     = 'server',
}

/**
 * Customer‑facing roles (un‑authenticated customers)
 */
export enum CustomerRole {
  Customer = 'customer',
}

/**
 * Union type when you need to accept any role
 */
export type AnyRole = PlatformRole | RestaurantRole | CustomerRole;
