import React from 'react'
import { useForm } from 'react-hook-form';

const PasswordUpdate = () => {
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
          htmlFor="new-password"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <input
          id="new-password"
          type="text"
          placeholder="Enter New Password"
          autoComplete="one-time-code"
          {...register('newPassword', {
            required: 'This is required',
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="renew-password"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <input
          id="renew-password"
          type="text"
          placeholder="Re-Enter New Password"
          autoComplete="one-time-code"
          {...register('newPassword', {
            required: 'This is required',
          })}
          className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2"
          required
        />
      </div>
      {/* Submit */}
      <button
        type="submit"
        className="w-full mt-2 inline-flex items-center cursor-pointer justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        Update Password
      </button>
    </form>
  )
}

export default PasswordUpdate
