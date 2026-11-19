import { Navigate } from 'react-router-dom';
import { useUser } from './usercontext';

/**
 * Redirects to /admin/dashboard if the current user's role is not in `allowed`.
 * Use this inside ProtectedLayout to enforce route-level RBAC.
 *
 * @param {string[]} allowed  - array of roles that may access this route
 * @param {function} [allowIf] - optional (user) => boolean for access a role can't express
 * @param {ReactNode} children - the page component to render when authorised
 */
export default function RoleGuard({ allowed, allowIf, children }) {
  const { user } = useUser();

  if (!allowed.includes(user?.role) && !(allowIf && allowIf(user))) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
