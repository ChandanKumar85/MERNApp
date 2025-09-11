import { useForm } from 'react-hook-form';
import type { RegisterData } from '../models/auth.interface';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => {
      console.log('Registration successful:', res);
      if (res.message === 'USER_REGISTERED') navigate('/login');
    }
  });

  const onSubmit = (data: RegisterData) => {
    mutate({
      ...data,
      // password: encryptedPassword,
      // confirmPassword: encryptedConfirmPassword,
    });
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Name */}
      <div className="space-y-1">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          {...register('name', {
            required: 'This is required',
            minLength: {
              value: 3,
              message: 'User Name must be at least 3 characters',
            },
            validate: (value) =>
              /^[a-zA-Z\s]+$/.test(value) ||
              'User Name must contain only letters and spaces',
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

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
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address',
            },
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="9999999999"
          autoComplete="tel"
          {...register('phone', {
            required: 'This is required',
            pattern: {
              value: /^\d{10}$/,
              message: 'Phone number must be 10 digits',
            },
            minLength: { value: 10, message: 'Phone number must be 10 digits' },
            maxLength: { value: 10, message: 'Phone number must be 10 digits' },
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
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
            required: 'This is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value:
                /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
              message:
                'Password must be at least 8 characters, include 1 uppercase, 1 number & 1 special character',
            },
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'This is required',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 inline-flex items-center cursor-pointer justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        {isPending ? (<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>) : (<span>Register</span>)}
        
      </button>
    </form>
  );
};

export default RegisterForm;
