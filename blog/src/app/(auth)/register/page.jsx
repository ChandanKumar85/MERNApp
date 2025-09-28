'use client';
import Link from 'next/link';

export default function Register() {
  return (
    <div className="container max-w-[400px] m-auto mt-5 shadow-lg p-5 rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Register User</h1>
      <form className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            className="border-gray-500 border-solid border-2 rounded-sm h-10 px-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            className="border-gray-500 border-solid border-2 rounded-sm h-10 px-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cnfPassword">Confirm Password</label>
          <input
            type="password"
            name="cnfPassword"
            className="border-gray-500 border-solid border-2 rounded-sm h-10 px-3"
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <button
            type="submit"
            className="p-2 bg-black text-white rounded-xl w-[200px]"
          >
            Submit
          </button>
          <Link href="/login">Click to login</Link>
        </div>
      </form>
    </div>
  );
}
