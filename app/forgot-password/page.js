'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to send reset email';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-green-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a password reset link to {email}. Click the link in the email to reset your password.
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🔑</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
