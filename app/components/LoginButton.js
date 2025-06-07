"use client"

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginButton() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (user) {
      await logout();
    } else {
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleAuth}
      className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-indigo-600 p-0.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-indigo-800"
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-150 rounded-md flex items-center">
        {user ? (
          <>
            <span className="mr-2">Logout</span>
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 6.34 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
              />
            </svg>
            Sign In
          </>
        )}
      </span>
    </button>
  );
} 