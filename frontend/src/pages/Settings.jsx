import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Field, Input, PasswordInput } from '../components/common/Input.jsx';
import { Switch } from '../components/common/Switch.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { cn } from '../utils/cn.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo } from '../utils/format.js';
import { authAPI, githubAPI, userAPI } from '../services/api.js';

const SECTIONS = [
  { value: 'account', label: 'Account', icon: 'user' },
  { value: 'security', label: 'Security', icon: 'shield' },
  { value: 'notifications', label: 'Notifications', icon: 'bell' },
  { value: 'appearance', label: 'Appearance', icon: 'monitor' },
];

const THEMES = [
  { value: 'dark', label: 'Dark', icon: 'moon', copy: 'The default. Built for long sessions.' },
  { value: 'light', label: 'Light', icon: 'sun', copy: 'Higher contrast in bright rooms.' },
  { value: 'system', label: 'System', icon: 'monitor', copy: 'Follows your operating system.' },
];

export default function Settings() {
  const [section, setSection] = useState('account');
  const { user, updateUser, logout } = useAuth();
  const { preference, setTheme } = useTheme();
  const toast = useToast();

  const [account, setAccount] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [prefs, setPrefs] = useState({
    projectActivity: true,
    mentions: true,
    memberChanges: true,
    aiResults: false,
    weeklyDigest: true,
  });
  const [github, setGithub] = useState(null);

  useEffect(() => {
    githubAPI.connection().then(setGithub).catch(() => setGithub({ connected: false }));
  }, []);

  const saveAccount = async () => {
    const updated = await userAPI.updateProfile(account);
    updateUser(updated);
    toast.success('Account updated');
  };

  const changePassword = async () => {
    if (passwords.next.length < 8) {
      toast.error('Use at least eight characters');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('The two passwords do not match');
      return;
    }
    await authAPI.changePassword({ current: passwords.current, next: passwords.next });
    setPasswords({ current: '', next: '', confirm: '' });
    toast.success('Password changed');
  };

  return (
    <AppLayout>
      <PageHeader title="Settings" description="Your account, security and how CollabSphere looks." />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSection(s.value)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                section === s.value ? 'bg-raised text-ink' : 'text-muted hover:bg-raised hover:text-ink'
              )}
            >
              <Icon name={s.icon} size={15} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-6">
          {section === 'account' && (
            <Card>
              <CardHeader title="Account" description="How you appear to everyone in your projects" />
              <div className="space-y-4 p-5">
                <Field label="Full name" htmlFor="set-name">
                  <Input id="set-name" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
                </Field>
                <Field label="Username" hint="Used in mentions and public pages" htmlFor="set-username">
                  <Input id="set-username" value={account.username} onChange={(e) => setAccount((a) => ({ ...a, username: e.target.value }))} />
                </Field>
                <Field label="Email" htmlFor="set-email">
                  <Input id="set-email" type="email" value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} />
                </Field>
                <div className="flex justify-end pt-1">
                  <Button variant="primary" icon="check" onClick={saveAccount}>
                    Save changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'security' && (
            <>
              <Card>
                <CardHeader title="Change password" description="Use something you have not used here before" />
                <div className="space-y-4 p-5">
                  <Field label="Current password" htmlFor="pw-current">
                    <PasswordInput id="pw-current" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
                  </Field>
                  <Field label="New password" htmlFor="pw-next">
                    <PasswordInput id="pw-next" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} />
                  </Field>
                  <Field label="Confirm new password" htmlFor="pw-confirm">
                    <PasswordInput id="pw-confirm" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
                  </Field>
                  <div className="flex justify-end pt-1">
                    <Button variant="primary" icon="key" onClick={changePassword}>
                      Change password
                    </Button>
                  </div>
                </div>
              </Card>

            </>
          )}

          {section === 'account' && (
            <Card>
              <CardHeader title="GitHub" description="Connect your own GitHub account for repository imports" />
              <div className="flex flex-wrap items-center gap-3 p-5">
                <Icon name="github" size={22} className="text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink">
                    {github?.connected ? `Connected as @${github.login}` : 'No GitHub account connected'}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">Only your backend-encrypted GitHub credential is stored.</p>
                </div>
                {github?.connected ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" icon="github" onClick={() => githubAPI.connect()}>Reconnect GitHub</Button>
                    <Button variant="ghost" icon="x" onClick={async () => { await githubAPI.disconnect(); setGithub({ connected: false }); toast.success('GitHub disconnected'); }}>Disconnect</Button>
                  </div>
                ) : <Button variant="secondary" icon="github" onClick={() => githubAPI.connect()}>Connect GitHub</Button>}
              </div>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardHeader title="Notifications" description="What reaches you, and what waits in the app" />
              <div className="divide-y divide-line px-5">
                <Switch
                  id="n-activity"
                  checked={prefs.projectActivity}
                  onChange={(v) => setPrefs((p) => ({ ...p, projectActivity: v }))}
                  label="Project activity"
                  description="Notes, uploads and status changes in projects you belong to."
                />
                <Switch
                  id="n-mentions"
                  checked={prefs.mentions}
                  onChange={(v) => setPrefs((p) => ({ ...p, mentions: v }))}
                  label="Mentions"
                  description="Someone writes @your-username in a note or comment."
                />
                <Switch
                  id="n-members"
                  checked={prefs.memberChanges}
                  onChange={(v) => setPrefs((p) => ({ ...p, memberChanges: v }))}
                  label="Member changes"
                  description="People joining or leaving your projects."
                />
                <Switch
                  id="n-ai"
                  checked={prefs.aiResults}
                  onChange={(v) => setPrefs((p) => ({ ...p, aiResults: v }))}
                  label="Assistant results"
                  description="Long-running generations finishing while you are elsewhere."
                />
                <Switch
                  id="n-digest"
                  checked={prefs.weeklyDigest}
                  onChange={(v) => setPrefs((p) => ({ ...p, weeklyDigest: v }))}
                  label="Weekly digest"
                  description="One email on Monday with what changed last week."
                />
              </div>
              <div className="flex justify-end border-t border-line px-5 py-3.5">
                <Button variant="primary" icon="check" onClick={() => toast.success('Notification settings saved')}>
                  Save preferences
                </Button>
              </div>
            </Card>
          )}

          {section === 'appearance' && (
            <Card>
              <CardHeader title="Appearance" description="Applies to this browser" />
              <div className="grid gap-3 p-5 sm:grid-cols-3">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-colors',
                      preference === t.value ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong'
                    )}
                  >
                    <Icon name={t.icon} size={18} className={preference === t.value ? 'text-accent' : 'text-muted'} />
                    <p className="mt-3 text-[14px] font-medium text-ink">{t.label}</p>
                    <p className="mt-1 text-[12.5px] leading-snug text-muted">{t.copy}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="border-danger p-5">
            <h2 className="font-display text-[14.5px] font-semibold text-ink">Sign out</h2>
            <p className="mt-1.5 text-[13px] text-muted">You can sign back in at any time with your email and password.</p>
            <Button variant="danger" icon="logout" className="mt-4" onClick={logout}>
              Sign out
            </Button>
          </Card>
        </div>
      </div>

    </AppLayout>
  );
}
