import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Field, Input, PasswordInput } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const validate = () => {
    const next = {};
    if (!form.email) next.email = 'Enter your email address.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'That email address is not valid.';
    else if (!form.email.trim().toLowerCase().endsWith('@gmail.com')) next.email = 'Use a Gmail address ending in @gmail.com.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login({ email: form.email, password: form.password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'We could not sign you in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in to CollabSphere"
      subtitle="Pick up where your team left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
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

        <Field label="Email" error={errors.email} htmlFor="email">
          <Input
            id="email"
            type="email"
            icon="mail"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@gmail.com"
            error={errors.email}
          />
        </Field>

        <Field label="Password" error={errors.password} htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="Your password"
            error={errors.password}
          />
        </Field>

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => set({ remember: e.target.checked })}
              className="h-4 w-4 rounded border-line bg-base accent-[var(--c-accent)]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[13px] text-muted transition-colors hover:text-ink">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} className="mt-2">
          Log in
        </Button>

        <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-center text-[12px] text-faint">
          Only Gmail addresses can access CollabSphere accounts.
        </p>
      </form>
    </AuthLayout>
  );
}
