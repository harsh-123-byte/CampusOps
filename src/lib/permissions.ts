import { UserRole, RequestStatus } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  STUDENT: 1,
  FACULTY: 2,
  ADMIN: 3,
};

export function canCreateRequest(role: UserRole): boolean {
  return role === "STUDENT" || role === "ADMIN";
}

export function canEditRequest(role: UserRole, status: RequestStatus, isOwner: boolean): boolean {
  if (role === "ADMIN") return true;
  if (!isOwner) return false;
  return status === "DRAFT" || status === "CHANGES_REQUESTED";
}

export function canCancelRequest(role: UserRole, status: RequestStatus, isOwner: boolean): boolean {
  if (role === "ADMIN") return true;
  if (!isOwner) return false;
  return status === "DRAFT" || status === "SUBMITTED" || status === "IN_REVIEW";
}

export function canReviewRequest(role: UserRole): boolean {
  return role === "FACULTY" || role === "ADMIN";
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return role === "ADMIN";
}

export function getRoleDashboardRoute(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "FACULTY":
      return "/faculty";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
