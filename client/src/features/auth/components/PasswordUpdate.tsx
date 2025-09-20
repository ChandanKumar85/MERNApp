import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routePaths';
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY as string;
interface PasswordUpdateFormData {
  password: string;
  confirmPassword: string;
}

const PasswordUpdate = (props: any) => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PasswordUpdateFormData>();

    const { mutate, isPending, isError, isSuccess, error } = useMutation({
      mutationFn: resetPassword,
      onSuccess: (res) => {
        if (res.message === 'PASSWORD_RESET_SUCCESSFUL') {
          setTimeout(() => {
            navigate(`${ROUTES.LOGIN}`);
          }, 3000);
        }
      },
      onError: (err: any) => {
        if (err.response?.data?.message === "TOKEN_EXPIRED") {
          setTimeout(() => {
            navigate(ROUTES.FORGOT_PASSWORD);
          }, 2000);
        }
      }
    });

    const onSubmit = (data: PasswordUpdateFormData) => {
      const encryptedPassword = CryptoJS.AES.encrypt(data.password, SECRET_KEY).toString();
      const encryptedConfirmPassword = CryptoJS.AES.encrypt(data.confirmPassword, SECRET_KEY).toString();
      mutate({ ...data, password: encryptedPassword, confirmPassword: encryptedConfirmPassword, token: props.resetToken });
    };
  return (
    <>
      {isError && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
          {error instanceof Error && 'Session time out. Please try again.'}
        </div>
      )}
      {isSuccess && (
        <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-md">
          Password has been successfully reset. You can now log in with your new password.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter New Password"
            {...register('password', {
              required: 'This is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value:
                  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message:
                  'Password must be at least 8 characters, include 1 uppercase, 1 number & 1 special character',
              },
            })}
            disabled={isSuccess}
            className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="Re-Enter New Password"
            {...register('confirmPassword', {
              required: 'This is required',
              validate: (value) =>
                value === watch('password') || 'Passwords do not match',
            })}
            disabled={isSuccess}
            className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full mt-2 inline-flex items-center cursor-pointer justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          {isPending ? (<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>) : (<span>Reset Password</span>)}
        </button>
      </form>
    </>
  )
}

export default PasswordUpdate
