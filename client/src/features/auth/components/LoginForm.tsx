import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { LoginData } from '../models/auth.interface';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const LoginForm = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginData>();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      console.log('Login successful:', res);
      setTokens(res.accessToken, res.refreshToken);
      if (res.message === 'LOGIN_SUCCESSFUL') navigate('/dashboard');
    }
  });

  const onSubmit = (data: LoginData) => {
    mutate({...data, password: data.password});
  };

  return (
    <>
      {isError && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
          {error instanceof Error && 'User or Password is wrong.'}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'This is required',
            })}
            className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password', {
            required: 'This is required'
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 inline-flex items-center cursor-pointer justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >

          {isPending ? (<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>) : (<span>Login</span>)}

        </button>
      </form>
    </>
  );
};

export default LoginForm;
