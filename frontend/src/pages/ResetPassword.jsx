import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Field, PasswordInput } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { authAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 8) next.password = 'Use at least eight characters.';
    if (form.confirm !== form.password) next.confirm = 'The two passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await authAPI.resetPassword({ token: 'demo-token', password: form.password });
      setDone(true);
      toast.success('Password changed');
      setTimeout(() => navigate('/login'), 1400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose something you have not used here before."
      footer={
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      {done ? (
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
          <Icon name="checkCircle" size={18} className="mt-0.5 shrink-0 text-ok" />
          <div className="text-[13.5px] leading-relaxed text-muted">
            <p className="font-medium text-ink">Password changed</p>
            <p className="mt-1">Taking you to the log in screen…</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="New password" error={errors.password} htmlFor="new-password">
            <PasswordInput
              id="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least eight characters"
              error={errors.password}
              autoFocus
            />
          </Field>
          <Field label="Confirm new password" error={errors.confirm} htmlFor="confirm-new">
            <PasswordInput
              id="confirm-new"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Type it once more"
              error={errors.confirm}
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
            Save new password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
