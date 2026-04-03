import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type AppRole = "admin" | "supervisor" | "accountant" | "employee";

function getFallbackRoute(hasRole: (role: AppRole) => boolean): string {
  if (hasRole("supervisor")) return "/projects";
  if (hasRole("accountant")) return "/treasury";
  if (hasRole("employee")) return "/projects";
  return "/notes"; // fallback for users with no specific role
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAdmin, rolesLoaded } = useAuth();
  const location = useLocation();

  if (loading || !rolesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin has access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check for required single role
  if (requiredRole && !hasRole(requiredRole)) {
    // Find a safe fallback route based on user roles
    const fallback = getFallbackRoute(hasRole);
    if (fallback !== location.pathname) {
      return <Navigate to={fallback} replace />;
    }
  }

  // Check for allowed roles (user must have at least one)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(role));
    if (!hasAllowedRole) {
      const fallback = getFallbackRoute(hasRole);
      if (fallback !== location.pathname) {
        return <Navigate to={fallback} replace />;
      }
    }
  }

  return <>{children}</>;
}
