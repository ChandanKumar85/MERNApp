import { Routes, Route } from 'react-router-dom';
import { AuthRoutes, useAuthStore } from '../features/auth';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const { accessToken } = useAuthStore();
  return (
    <Routes>
      {!accessToken ? (
        <Route path="/*" element={<AuthRoutes />} />
      ) : (
        <Route path="/*" element={<PrivateRoute />} />
      )}
    </Routes>
  );
};

export default AppRoutes;
