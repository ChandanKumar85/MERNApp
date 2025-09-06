import React from 'react'
import LoginForm from '../components/LoginForm'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-gray-600 mb-6">Login to continue</p>
          <LoginForm />
          <p className="text-xs text-gray-500 mt-4">By continuing you accept our Terms & Privacy Policy.</p>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-gray-900 hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link to="/auth/forgot-password" className="font-medium text-gray-900 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
