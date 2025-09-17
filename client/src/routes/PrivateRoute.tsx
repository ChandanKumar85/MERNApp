import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from './routePaths';

const LayoutApp = lazy(() => import('../components/layout/LayoutApp'));
const DashboardPage = lazy(() => import('../pages/dashboard/Dashboard'));
const Users = lazy(() => import('../pages/Users/Users'));

const PrivateRoute = () => {
  return (
    <Routes>
      <Route path={ROUTES.BASE} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route element={<LayoutApp />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.USERS} element={<Users />} />

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
  );
};

export default PrivateRoute;
