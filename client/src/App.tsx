import { Suspense, useEffect } from 'react';
import AppRoutes from './routes/AppRoute';
import { useAuthStore } from './features/auth/store/authStore';

function App() {
  useEffect(() => {
    // // Run once on mount
    // useAuthStore.getState().checkTokenExpiry();

    // // Run every 1 minute
    // const interval = setInterval(() => {
    //   useAuthStore.getState().checkTokenExpiry();
    // }, 60 * 1000);

    // return () => clearInterval(interval);
    useAuthStore.getState().checkTokenExpiry();
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
