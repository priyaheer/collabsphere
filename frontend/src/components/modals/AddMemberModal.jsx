import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { Select } from '../common/Input.jsx';
import { cn } from '../../utils/cn.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { memberAPI } from '../../services/api.js';

export function AddMemberModal({ open, onClose, onAdd, existingIds = [], projectId }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('Member');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(query, 180);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(null);
      setRole('Member');
      setUsers([]);
    }
  }, [open]);

  useEffect(() => {
    let active = true;
    async function search() {
      if (!open || !projectId || !debounced.trim()) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const rows = await memberAPI.search(projectId, debounced);
        if (active) setUsers(rows);
      } finally {
        if (active) setLoading(false);
      }
    }
    search();
    return () => {
      active = false;
    };
  }, [debounced, open, projectId]);

  const results = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return users
      .filter((u) => !existingIds.includes(u._id))
      .filter((u) => !needle || u.name.toLowerCase().includes(needle) || u.username.toLowerCase().includes(needle));
  }, [users, debounced, existingIds]);

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onAdd({ userId: selected._id, role });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a member"
      description="They get access to every note and file in this project."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!selected} isLoading={saving} icon="plus">
            Add member
          </Button>
        </>
      }
    >
      <Input
        icon="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or username"
        autoFocus
      />

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {results.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">
            {loading ? 'Searching…' : 'No one matches that. Everyone else is already on the project.'}
          </p>
        )}
        {results.map((user) => (
          <button
            key={user._id}
            type="button"
            onClick={() => setSelected(user)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
              selected?._id === user._id ? 'border-accent bg-accentSoft' : 'border-transparent hover:bg-raised'
            )}
          >
            <Avatar user={user} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium text-ink">{user.name}</span>
              <span className="block truncate text-[12px] text-faint">@{user.username}</span>
            </span>
            {selected?._id === user._id && <Icon name="check" size={16} className="text-accent" />}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 border-t border-line pt-4">
          <label htmlFor="member-role" className="mb-1.5 block text-[13px] font-medium text-muted">
            Role
          </label>
          <Select
            id="member-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'Member', label: 'Member — read and write content' },
              { value: 'Admin', label: 'Admin — manage members and settings' },
            ]}
          />
        </div>
      )}
    </Modal>
  );
}
