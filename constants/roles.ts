export const Role = {
  Admin: 0,
  Manufacturer: 1,
  Retailer: 2,
  ServiceCenter: 3,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: readonly Role[] = Object.values(Role);

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: "Admin",
  [Role.Manufacturer]: "Manufacturer",
  [Role.Retailer]: "Retailer",
  [Role.ServiceCenter]: "Service Center",
};

export function toRole(value: bigint | number): Role | null {
  const role = Number(value);
  return ALL_ROLES.includes(role as Role) ? (role as Role) : null;
}

export function describeRoles(roles: readonly Role[]): string {
  return roles.length === 0 ? "Consumer (no role)" : roles.map((role) => ROLE_LABELS[role]).join(", ");
}
