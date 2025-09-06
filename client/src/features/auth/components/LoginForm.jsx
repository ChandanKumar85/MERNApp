import React from 'react';

const LoginForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2" required />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none px-3 py-2" required />
      </div>

      {/* Submit */}
      <button type="submit" className="w-full mt-2 inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
