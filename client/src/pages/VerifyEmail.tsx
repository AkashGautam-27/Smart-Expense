import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, RefreshCw, LogOut, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyEmail() {
  const { authState, verifyEmailOtp, resendEmailOtp, logout } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await verifyEmailOtp(otp);
      setSuccess('Your email address has been verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      await resendEmailOtp();
      setSuccess('A fresh 6-digit verification code has been dispatched to your email.');
      setCountdown(60); // 1 minute cooldown
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div id="verify_email_page" className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-850 rounded-2xl p-8 shadow-xl relative z-10 space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100/40 shadow-sm">
            <Mail className="h-7 w-7" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 font-sans">
              Verify Your Email
            </h1>
            <p className="text-slate-500 dark:text-neutral-400 text-sm max-w-sm">
              We've send an email containing a 6-digit verification OTP code to:
            </p>
            <p className="font-semibold text-slate-800 dark:text-neutral-200 text-sm bg-slate-50 dark:bg-neutral-950/60 py-1.5 px-3 rounded-lg inline-block border border-slate-100 dark:border-neutral-850">
              {authState.user?.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider block text-center">
              One-Time Passcode (OTP)
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-3xl font-extrabold letter-spacing-4 py-3 border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-indigo-600 dark:text-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors tracking-widest placeholder:text-slate-300 dark:placeholder:text-neutral-700"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Confirm Verification
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-neutral-850 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 disabled:text-slate-400 disabled:no-underline cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend OTP Code'}
          </button>

          <button
            onClick={logout}
            className="text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
