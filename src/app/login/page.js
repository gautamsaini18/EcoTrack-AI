'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Leaf, Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signUp, signIn, loading, isMock } = useAuth();

  const [isSignUp, setIsSignUp] = useState(() => searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !displayName)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-panel-strong p-8 rounded-3xl animate-slide-up relative z-10 shadow-2xl">
      <div className="flex flex-col items-center justify-center text-center gap-3 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 shadow-lg shadow-emerald-500/5">
          <Leaf className="w-7 h-7 fill-emerald-400/20" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isSignUp ? 'Create your EcoTrack account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-gray-500 font-light max-w-xs">
          {isSignUp ? 'Start calculating and reducing your carbon output' : 'Log in to view metrics and chat with AI'}
        </p>
      </div>

      {isMock && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex gap-3 items-start text-sm text-amber-200/80">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Sandbox Mode:</span> Use any mock email and password. All data is stored in your browser.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3 items-center text-sm text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignUp && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
            <input
              type="email"
              placeholder="hello@ecotrack.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-3.5 rounded-2xl gradient-green-btn text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 shadow-lg"
        >
          {submitting ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-6 pt-5 border-t border-white/5">
        {isSignUp ? (
          <span>
            Already have an account?{' '}
            <button
              onClick={() => setIsSignUp(false)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
            >
              Sign In
            </button>
          </span>
        ) : (
          <span>
            New to EcoTrack?{' '}
            <button
              onClick={() => setIsSignUp(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
            >
              Create an account
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative min-h-[calc(100vh-4rem)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none -z-0" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-panel-strong p-8 rounded-3xl text-center text-gray-500">
          Loading Security Adapter...
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
