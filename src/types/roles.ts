// src/types/roles.ts

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
  Owner      = 'owner',      // full control of a single restaurant/bar
  Manager    = 'manager',
  Supervisor = 'supervisor',
  Server     = 'server',
}

/**
 * Union type when you need to accept any role
 */
export type AnyRole = PlatformRole | RestaurantRole;
