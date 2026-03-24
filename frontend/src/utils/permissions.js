export const ROLES = { ADMIN: 'Admin', IT: 'IT Manager', TECH: 'Technicien' };

export const canEdit   = (role) => [ROLES.ADMIN, ROLES.IT].includes(role);
export const canDelete = (role) => role === ROLES.ADMIN;
export const canAssign = (role) => [ROLES.ADMIN, ROLES.IT, ROLES.TECH].includes(role);