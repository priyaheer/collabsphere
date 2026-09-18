import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Input } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { authAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function VerifyEmail() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem('collabsphere.pendingVerificationEmail') || ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    authAPI
      .verifyEmail({ token })
      .then(() => {
        if (cancelled) return;
        localStorage.removeItem('collabsphere.pendingVerificationEmail');
        toast.success('Email verified', { description: 'You can log in now.' });
        navigate('/login', { replace: true });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Verification failed.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, toast, token]);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    setError('');
    if (!email.trim()) {
      setError('Enter the Gmail address you used to register.');
      return;
    }
    try {
      await authAPI.resendVerification({ email });
      setCooldown(60);
      toast.info('Verification email sent', { description: 'It can take a minute to arrive.' });
    } catch (err) {
      setError(err.message || 'Could not send a new verification email.');
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Open the verification link in your Gmail inbox to finish setting up."
      footer={
        <>
          Wrong address?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Start over
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <label className="block text-[13px] font-medium text-ink" htmlFor="verify-email">
          <span className="mb-1.5 block">Gmail</span>
          <Input
            id="verify-email"
            type="email"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            disabled={Boolean(token)}
          />
        </label>

        {error && (
          <p className="flex items-center gap-1.5 text-[13px] text-danger">
            <Icon name="alert" size={14} />
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || loading}
          className="w-full text-center text-[13px] text-muted transition-colors hover:text-ink"
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification link'}
        </button>
      </div>
    </AuthLayout>
  );
}
