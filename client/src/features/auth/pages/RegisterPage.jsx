import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-gray-600 mb-6">Register to continue</p>
          <RegisterForm />
          <p className="text-xs text-gray-500 mt-4">By continuing you accept our Terms & Privacy Policy.</p>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
