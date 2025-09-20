import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/routePaths';
import { lazy, useEffect, useState } from 'react';

const ForgotPasswordForm = lazy(() => import('../components/ForgotPasswordForm'));
const Otpform = lazy(() => import('../components/Otpform'));
const PasswordUpdate = lazy(() => import('../components/PasswordUpdate'));

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'forgot' | 'otp' | 'update'>('forgot');

  
  const resetToken = searchParams.get('reset');
  // console.log("Reset Token:", resetToken);

  useEffect(() => {
    if (resetToken) {
      setStep('update');
    } else {
      setStep('forgot');
    }
  }, [resetToken]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Forgot Password</h1>
          <p className="text-sm text-gray-600 mb-6">Enter your email to reset your password</p>
          
          {step === 'forgot' ? (
            <ForgotPasswordForm />
          ) : step === 'otp' ? (
            <Otpform />
          ) : (
            <PasswordUpdate resetToken={resetToken} />
          )}
          
          <p className="text-xs text-gray-500 mt-4">We'll send you a link to reset your password. Make sure to check your inbox.</p>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
