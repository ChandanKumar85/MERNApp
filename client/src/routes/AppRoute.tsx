import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// lazy-loaded pages
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
