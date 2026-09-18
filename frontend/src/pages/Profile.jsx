import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Field, Input, Textarea } from '../components/common/Input.jsx';
import { ProjectCardCompact } from '../components/cards/ProjectCard.jsx';
import { ActivityFeed } from '../components/cards/ActivityFeed.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import { activityAPI, projectAPI, userAPI } from '../services/api.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', location: user?.location || '', website: user?.website || '' });
  const [saving, setSaving] = useState(false);

  const projects = useAsync(() => projectAPI.list({ scope: 'mine' }), []);
  const activity = useAsync(() => activityAPI.recent(6), []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await userAPI.updateProfile(form);
      updateUser(updated);
      setEditing(false);
      toast.success('Profile updated');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Card className="overflow-hidden">
        <div className="relative h-28 cs-grid">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(70% 140% at 20% 0%, var(--c-accent-soft), transparent 70%)' }}
          />
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="-mt-10 rounded-full ring-4 ring-surface">
              <Avatar user={user} size="xl" />
            </span>
            <div className="pb-1">
              <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">{user?.name}</h1>
              <p className="text-[13px] text-muted">@{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Button variant="secondary" icon="settings" to="/settings">
              Settings
            </Button>
            <Button variant={editing ? 'primary' : 'secondary'} icon={editing ? 'check' : 'edit'} onClick={() => (editing ? save() : setEditing(true))} isLoading={saving}>
              {editing ? 'Save profile' : 'Edit profile'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="p-5">
            {editing ? (
              <div className="space-y-4">
                <Field label="Name" htmlFor="profile-name">
                  <Input id="profile-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </Field>
                <Field label="Bio" htmlFor="profile-bio">
                  <Textarea id="profile-bio" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                </Field>
                <Field label="Location" htmlFor="profile-location">
                  <Input id="profile-location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </Field>
                <Field label="Website" htmlFor="profile-website">
                  <Input id="profile-website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://" />
                </Field>
                <Button variant="ghost" fullWidth onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <p className="text-[13.5px] leading-relaxed text-muted">{user?.bio}</p>
                <dl className="mt-5 space-y-2.5 text-[13px]">
                  {[
                    { icon: 'mail', value: user?.email },
                    { icon: 'globe', value: user?.location },
                    { icon: 'link', value: user?.website },
                    { icon: 'calendar', value: `Joined ${formatDate(user?.joinedAt)}` },
                  ]
                    .filter((row) => row.value)
                    .map((row) => (
                      <div key={row.icon} className="flex items-center gap-2.5 text-muted">
                        <Icon name={row.icon} size={14} className="shrink-0 text-faint" />
                        <span className="truncate">{row.value}</span>
                      </div>
                    ))}
                </dl>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-[14px] font-semibold text-ink">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(user?.skills || []).map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              title="Projects you own"
              action={
                <Link to="/projects" className="text-[13px] text-muted transition-colors hover:text-ink">
                  View all
                </Link>
              }
            />
            <div className="space-y-2 p-4">
              {(projects.data || []).slice(0, 5).map((p) => (
                <ProjectCardCompact key={p._id} project={p} />
              ))}
              {!projects.loading && (projects.data || []).length === 0 && (
                <p className="py-8 text-center text-[13px] text-muted">No projects yet.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" />
            {activity.loading ? <ActivityFeed loading /> : <ActivityFeed items={activity.data || []} />}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
