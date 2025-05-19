/**
 * Role definitions for the application
 * Used to maintain consistency across the frontend and ensure
 * that the roles align with the backend definitions
 */
export const ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin'
};

/**
 * Role hierarchy and permissions
 * Each role includes its own permissions plus all permissions from lower roles
 */
export const ROLE_HIERARCHY = {
  [ROLES.USER]: ['viewPublicPages', 'manageOwnProfile', 'viewOwnBookings', 'createBooking'],
  [ROLES.STAFF]: ['viewStaffDashboard', 'manageBookings', 'manageRooms', 'viewGuests', 'viewSchedule'],
  [ROLES.ADMIN]: ['viewAdminDashboard', 'manageUsers', 'manageServices', 'managePromotions', 'viewReports']
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - The user object containing role
 * @param {string} permission - The permission to check
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  // Get all permissions for the user's role and roles below it in hierarchy
  const userPermissions = getAllPermissionsForRole(user.role);
  return userPermissions.includes(permission);
};

/**
 * Get all permissions for a role, including inherited permissions
 * @param {string} role - The role to get permissions for
 * @returns {Array<string>} Array of permissions
 */
export const getAllPermissionsForRole = (role) => {
  let permissions = [];

  // Add permissions based on role hierarchy
  switch (role) {
    case ROLES.ADMIN:
      permissions = [
        ...permissions,
        ...ROLE_HIERARCHY[ROLES.ADMIN]
      ];
      // Admin inherits staff permissions
      // falls through
    case ROLES.STAFF:
      permissions = [
        ...permissions,
        ...ROLE_HIERARCHY[ROLES.STAFF]
      ];
      // Staff inherits user permissions
      // falls through
    case ROLES.USER:
      permissions = [
        ...permissions,
        ...ROLE_HIERARCHY[ROLES.USER]
      ];
      break;
    default:
      break;
  }

  return permissions;
};

/**
 * Check if a user has access to a specific route based on allowed roles
 * @param {Object} user - The user object containing role
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 * @returns {boolean} Whether user has access
 */
export const hasRouteAccess = (user, allowedRoles = []) => {
  if (!user || !user.role) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(user.role);
}; 