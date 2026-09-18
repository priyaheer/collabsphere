import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { cn } from '../utils/cn.js';
import { authAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function VerifyEmail() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const toast = useToast();
  const navigate = useNavigate();

  const setDigit = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    setDigits((d) => d.map((v, i) => (i === index ? clean : v)));
    if (clean && index < 5) inputs.current[index + 1]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyEmail({ code });
      toast.success('Email verified');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a six-digit code to your inbox. Enter it below to finish setting up."
      footer={
        <>
          Wrong address?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Start over
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="flex gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digit && i > 0) inputs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              aria-label={`Digit ${i + 1}`}
              className={cn(
                'h-14 flex-1 rounded-xl border bg-base text-center font-display text-[20px] text-ink transition-colors focus:border-accent focus:outline-none',
                error ? 'border-danger' : 'border-line'
              )}
            />
          ))}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-[13px] text-danger">
            <Icon name="alert" size={14} />
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
          Verify email
        </Button>

        <button
          type="button"
          onClick={() => toast.info('Code resent', { description: 'It can take a minute to arrive.' })}
          className="w-full text-center text-[13px] text-muted transition-colors hover:text-ink"
        >
          Resend the code
        </button>

        <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-center text-[12px] text-faint">
          Demo build: any six digits will pass.
        </p>
      </form>
    </AuthLayout>
  );
}
