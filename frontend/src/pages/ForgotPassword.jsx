import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Field, Input } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { authAPI } from '../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('That email address is not valid.');
      return;
    }
    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Use a Gmail address ending in @gmail.com.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Password reset is not available yet.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`If an account exists for ${email}, a reset link is on its way. The link expires in 30 minutes.`}
        footer={
          <Link to="/login" className="font-medium text-accent hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
          <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-accent" />
          <div className="text-[13.5px] leading-relaxed text-muted">
            <p className="font-medium text-ink">Nothing arrived?</p>
            <p className="mt-1">Check the spam folder, or</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-1.5 text-accent transition-colors hover:underline"
            >
              try a different address
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on the account and we will send a link to set a new password."
      footer={
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={error} htmlFor="forgot-email">
          <Input
            id="forgot-email"
            type="email"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            error={error}
            autoFocus
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
