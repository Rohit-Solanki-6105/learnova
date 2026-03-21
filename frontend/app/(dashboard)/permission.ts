/**
 * Role Definitions matching the Django Backend Choices mapping:
 * Admin (1), Instructor (2), Learner (3)
 */
export enum Role {
  ADMIN = 1,
  INSTRUCTOR = 2,
  LEARNER = 3,
}

/**
 * Standard CRUD Operations
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface RoutePermission {
  url: string;
  allowedRoles: Role[];
  actions?: Partial<Record<Role, Action[]>>;
}

/**
 * RBAC Central Configuration
 * Maps primary routes and resource keys to roles and their allowed actions.
 */
export const PERMISSIONS: RoutePermission[] = [
  {
    url: '/dashboard',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['read'],
      [Role.LEARNER]: ['read'],
    }
  },
  {
    url: '/courses',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['create', 'read', 'update', 'delete'], // Can fully manage their own courses
      [Role.LEARNER]: ['read'], // Can only browse, enroll and view contents
    }
  },
  {
    url: '/lessons',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['create', 'read', 'update', 'delete'], 
      [Role.LEARNER]: ['read'], // Can read lesson contents if enrolled
    }
  },
  {
    url: '/quizzes',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['create', 'read', 'update', 'delete'],
      [Role.LEARNER]: ['read', 'create'], // 'create' action implies submitting a quiz attempt
    }
  },
  {
    url: '/enrollments',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['read', 'update'], // Instructors can view who is enrolled in their courses
      [Role.LEARNER]: ['create', 'read'], // Learners can enroll (create) and view their own
    }
  },
  {
    url: '/users',
    allowedRoles: [Role.ADMIN],
    actions: {
      [Role.ADMIN]: ['manage'], // Only admins have access to the global users route/management
    }
  },
  {
    url: '/settings',
    allowedRoles: [Role.ADMIN, Role.INSTRUCTOR, Role.LEARNER],
    actions: {
      [Role.ADMIN]: ['manage'],
      [Role.INSTRUCTOR]: ['manage'],
      [Role.LEARNER]: ['manage'], // Everyone can manage their personal settings
    }
  }
];

/**
 * Utility: Check if a user role can access an explicit URL path block.
 */
export const canAccessRoute = (role: Role | undefined, path: string): boolean => {
  if (!role) return false;
  
  // Find the most specific matching route from our permissions config
  const matchingRoute = PERMISSIONS.find(p => path.startsWith(p.url));
  
  if (!matchingRoute) {
    // If route isn't defined explicitly, deny access by default to enforce security
    return false;
  }

  return matchingRoute.allowedRoles.includes(role);
};

/**
 * Utility: Check if a user role can perform a specific CRUD action on a route/resource.
 */
export const canPerformAction = (role: Role | undefined, path: string, action: Action): boolean => {
  if (!role) return false;

  const matchingRoute = PERMISSIONS.find(p => path.startsWith(p.url));
  
  if (!matchingRoute) return false;
  
  const roleActions = matchingRoute.actions?.[role];
  if (!roleActions) return false;
  
  // 'manage' is a wildcard permission giving full CRUD rights
  return roleActions.includes(action) || roleActions.includes('manage');
};
