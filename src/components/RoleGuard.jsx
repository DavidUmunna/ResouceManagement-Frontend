import { Navigate } from 'react-router-dom';
import { useUser } from './usercontext';

/**
 * Redirects to /admin/dashboard if the current user's role is not in `allowed`.
 * Use this inside ProtectedLayout to enforce route-level RBAC.
 *
 * @param {string[]} allowed  - array of roles that may access this route
 * @param {ReactNode} children - the page component to render when authorised
 */
export default function RoleGuard({ allowed, children }) {
  const { user } = useUser();

  if (!allowed.includes(user?.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
