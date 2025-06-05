// src/types/roles.ts
/**
 * Platform‑wide roles (multi‑tenant admin)
 */
export var PlatformRole;
(function (PlatformRole) {
    PlatformRole["Superadmin"] = "superadmin";
    PlatformRole["PlatformAdmin"] = "platform_admin";
})(PlatformRole || (PlatformRole = {}));
/**
 * Restaurant‑level roles (per‑tenant)
 */
export var RestaurantRole;
(function (RestaurantRole) {
    RestaurantRole["Owner"] = "owner";
    RestaurantRole["Manager"] = "manager";
    RestaurantRole["Supervisor"] = "supervisor";
    RestaurantRole["Server"] = "server";
})(RestaurantRole || (RestaurantRole = {}));
/**
 * Customer‑facing roles (un‑authenticated customers)
 */
export var CustomerRole;
(function (CustomerRole) {
    CustomerRole["Customer"] = "customer";
})(CustomerRole || (CustomerRole = {}));
