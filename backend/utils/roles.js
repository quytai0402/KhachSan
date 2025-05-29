/**
 * Role definitions for the application
 * These should match the enum values in the User model
 */
const { USER_ROLES } = require('../constants');

// Use centralized roles from constants
const ROLES = USER_ROLES;

/**
 * Role hierarchy and permissions
 * Each role includes its own permissions plus all permissions from lower roles
 */
const ROLE_HIERARCHY = {
  [ROLES.USER]: ['viewPublicData', 'manageOwnProfile', 'viewOwnBookings', 'createBooking'],
  [ROLES.STAFF]: ['viewStaffData', 'manageBookings', 'manageRooms', 'viewGuests', 'viewSchedule'],
  [ROLES.ADMIN]: ['viewAdminData', 'manageUsers', 'manageServices', 'managePromotions', 'viewReports']
};

/**
 * Get all permissions for a role, including inherited permissions
 * @param {string} role - The role to get permissions for
 * @returns {Array<string>} Array of permissions
 */
const getAllPermissionsForRole = (role) => {
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
 * Check if a user has a specific permission
 * @param {Object} user - The user object containing role
 * @param {string} permission - The permission to check
 * @returns {boolean} Whether user has the permission
 */
const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  // Get all permissions for the user's role and roles below it in hierarchy
  const userPermissions = getAllPermissionsForRole(user.role);
  return userPermissions.includes(permission);
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  getAllPermissionsForRole,
  hasPermission
}; 