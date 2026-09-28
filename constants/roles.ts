export const Role = {
  Admin: 0,
  Manufacturer: 1,
  Retailer: 2,
  ServiceCenter: 3,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: readonly Role[] = Object.values(Role);

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: "Administrador",
  [Role.Manufacturer]: "Fabricante",
  [Role.Retailer]: "Varejista",
  [Role.ServiceCenter]: "Assistência técnica",
};

export function toRole(value: bigint | number): Role | null {
  const role = Number(value);
  return ALL_ROLES.includes(role as Role) ? (role as Role) : null;
}

export function describeRoles(roles: readonly Role[]): string {
  return roles.length === 0 ? "Consumidor (sem papel)" : roles.map((role) => ROLE_LABELS[role]).join(", ");
}
