import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Field, Input, PasswordInput } from '../components/common/Input.jsx';
import { authAPI } from '../services/api.js';

const stages = { email: 'email', otp: 'otp', password: 'password' };

export default function ForgotPassword() {
  const [stage, setStage] = useState(stages.email);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = setTimeout(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const submitEmail = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@gmail.com')) {
      setError('Use the Gmail address registered with your account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setStage(stages.otp);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not send the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyResetOtp({ email, otp });
      setStage(stages.password);
    } catch (err) {
      setError(err.message || 'Could not verify the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) {
      setError('Use at least eight characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, ...form });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not update the password.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not resend the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const title = stage === stages.email ? 'Forgot your password?' : stage === stages.otp ? 'Enter reset code' : 'Create a new password';
  const subtitle = stage === stages.email
    ? 'Enter your registered Gmail address and we will send a reset code.'
    : stage === stages.otp
      ? `Enter the 6-digit code sent to ${email}.`
      : 'Set a new password for your CollabSphere account.';

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      footer={
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      {stage === stages.email && (
        <form onSubmit={submitEmail} className="space-y-4" noValidate>
          <Field label="Email" error={error} htmlFor="reset-email">
            <Input id="reset-email" type="email" icon="mail" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" error={error} autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>Send OTP</Button>
        </form>
      )}

      {stage === stages.otp && (
        <form onSubmit={verifyOtp} className="space-y-4" noValidate>
          <Field label="6-digit OTP" error={error} htmlFor="reset-otp">
            <Input id="reset-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="000000" error={error} autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>Verify OTP</Button>
          <button type="button" onClick={resend} disabled={loading || resendCooldown > 0} className="w-full text-center text-[13px] text-muted hover:text-ink">
            {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </form>
      )}

      {stage === stages.password && (
        <form onSubmit={updatePassword} className="space-y-4" noValidate>
          <Field label="New password" error={error} htmlFor="new-password">
            <PasswordInput id="new-password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least eight characters" error={error} autoFocus />
          </Field>
          <Field label="Confirm password" htmlFor="confirm-password">
            <PasswordInput id="confirm-password" autoComplete="new-password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="Type it once more" />
          </Field>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>Update password</Button>
        </form>
      )}
    </AuthLayout>
  );
}
