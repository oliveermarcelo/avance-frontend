import type { UserRole } from "@prisma/client";

export const STUDENT_PREFIX = "/inicio";
export const INSTRUCTOR_PREFIX = "/instrutor";
export const ADMIN_PREFIX = "/admin";

export function getDefaultRouteForRole(role: UserRole | string | null | undefined): string {
  switch (role) {
    case "ADMIN":
      return ADMIN_PREFIX;
    case "INSTRUCTOR":
      return INSTRUCTOR_PREFIX;
    case "STUDENT":
    default:
      return STUDENT_PREFIX;
  }
}

export function canAccessRoute(role: UserRole | string | null | undefined, pathname: string): boolean {
  if (pathname.startsWith(ADMIN_PREFIX)) return role === "ADMIN";
  if (pathname.startsWith(INSTRUCTOR_PREFIX)) return role === "INSTRUCTOR";
  return true;
}