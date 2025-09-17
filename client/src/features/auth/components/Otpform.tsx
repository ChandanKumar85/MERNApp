import React from 'react';
import { useForm } from 'react-hook-form';

const Otpform = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm();
  return (
    <form className="space-y-4" noValidate>
      <div className="space-y-1">
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          Enter OTP
        </label>
        <input
          id="otp"
          type="number"
          max-length={6}
          placeholder="Enter the OTP"
          autoComplete="one-time-code"
          {...register('otp', {
            required: 'This is required',
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
      </div>
          <div className='text-sm text-green-800 text-center'>
            OTP will be expired in 00:10
          </div>
      {/* Submit */}
      <button
        type="submit"
        className="w-full mt-2 inline-flex items-center cursor-pointer justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        Verify OTP
      </button>
    </form>
  );
};

export default Otpform;
