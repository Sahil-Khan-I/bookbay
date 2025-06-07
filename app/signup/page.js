"use client"

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      await updateProfile(newUser, {
        displayName: formData.name
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to create account');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-900 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-900 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-60 w-80 h-80 bg-violet-900 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        <Link href="/" className="text-3xl font-bold text-white mb-16">Startanator</Link>
        
        <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
          <h1 className="text-2xl font-bold text-center mb-8">Join Startanator</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-sm text-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-70"
              >
                [SIGN UP]
              </button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-green-400/70 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-green-500 hover:text-green-400">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
} 