import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface Props {
  allow: Array<'patient' | 'doctor' | 'finance'>;
  redirectTo?: string;
}

export const ProtectedRouteByRole = ({
  allow,
  redirectTo = '/',
}: Props) => {
  const { role } = useAuth();

  if (!role || !allow.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

