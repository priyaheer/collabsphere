import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Field, Input, PasswordInput } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { cn } from '../utils/cn.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function strengthOf(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const score = strengthOf(form.password);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Tell us what to call you.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'That email address is not valid.';
    else if (!form.email.trim().toLowerCase().endsWith('@gmail.com')) next.email = 'Use a Gmail address ending in @gmail.com.';
    if (form.password.length < 8) next.password = 'Use at least eight characters.';
    if (form.confirm !== form.password) next.confirm = 'The two passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      localStorage.setItem('collabsphere.pendingVerificationEmail', form.email.trim().toLowerCase());
      toast.success('Account created', { description: 'Check Gmail for your verification link.' });
      navigate('/verify-email', { state: { email: form.email.trim().toLowerCase() } });
    } catch (err) {
      const fieldError = err.details?.errors?.[0];
      if (fieldError?.field) setErrors({ [fieldError.field]: fieldError.message || err.message });
      else if (err.details?.field) setErrors({ [err.details.field]: err.message });
      else setSubmitError(err.message || 'We could not create the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Free for solo projects. Invite your team whenever you are ready."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {submitError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised px-3.5 py-3 text-[13px] text-danger">
            <Icon name="alert" size={15} className="mt-px shrink-0" />
            {submitError}
          </div>
        )}

        <Field label="Full name" error={errors.name} htmlFor="name">
          <Input
            id="name"
            icon="user"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Aarav Mehta"
            error={errors.name}
          />
        </Field>

        <Field label="Email" error={errors.email} htmlFor="reg-email">
          <Input
            id="reg-email"
            type="email"
            icon="mail"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@gmail.com"
            error={errors.email}
          />
        </Field>

        <Field label="Password" error={errors.password} htmlFor="reg-password">
          <PasswordInput
            id="reg-password"
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="At least eight characters"
            error={errors.password}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i < score ? (score <= 1 ? 'bg-danger' : score <= 2 ? 'bg-warn' : 'bg-ok') : 'bg-raised'
                    )}
                  />
                ))}
              </div>
              <span className="text-[11.5px] text-faint">{STRENGTH_LABEL[score]}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm password" error={errors.confirm} htmlFor="confirm">
          <PasswordInput
            id="confirm"
            value={form.confirm}
            onChange={(e) => set({ confirm: e.target.value })}
            placeholder="Type it once more"
            error={errors.confirm}
          />
        </Field>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} className="mt-2">
          Create account
        </Button>

        <p className="text-center text-[12px] leading-relaxed text-faint">
          By creating an account you agree to the terms of service and privacy policy.
        </p>
      </form>
    </AuthLayout>
  );
}
