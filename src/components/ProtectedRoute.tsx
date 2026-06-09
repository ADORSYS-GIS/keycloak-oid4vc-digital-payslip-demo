import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Authentication is handled by AuthProvider via programmatic ROPC login
  // No redirect-based login needed — always render children
  return <>{children}</>;
};

export default ProtectedRoute;
