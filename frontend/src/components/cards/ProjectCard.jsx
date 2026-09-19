import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Badge, StatusBadge, VisibilityBadge } from '../common/Badge.jsx';
import { AvatarGroup } from '../common/Avatar.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { Dropdown } from '../common/Dropdown.jsx';
import { timeAgo } from '../../utils/format.js';

export function ProjectCard({ project, view = 'grid', onEdit, onDelete, onToggleStar }) {
  const members = project.members.map((m) => m.user).filter(Boolean);
  const owner = project.owner || members.find((member) => member._id === project.ownerId);

  const menu = (
    <Dropdown
      align="right"
      trigger={
        <button
          type="button"
          aria-label="Project actions"
          onClick={(e) => e.preventDefault()}
          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-raised hover:text-ink"
        >
          <Icon name="more" size={16} />
        </button>
      }
      items={[
        { label: project.starred ? 'Remove star' : 'Star project', icon: 'star', onClick: () => onToggleStar?.(project) },
        { label: 'Edit details', icon: 'edit', onClick: () => onEdit?.(project) },
        { label: 'Open public page', icon: 'globe', onClick: () => window.open(`/public/project/${project._id}`, '_blank') },
        { divider: true },
        { label: 'Delete project', icon: 'trash', tone: 'danger', onClick: () => onDelete?.(project) },
      ]}
    />
  );

  if (view === 'list') {
    return (
      <Link
        to={`/projects/${project._id}`}
        className="flex items-center gap-4 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line"
          style={{ color: project.accent }}
        >
          <Icon name="folder" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-ink">{project.name}</span>
            {project.starred && <Icon name="star" size={12} filled className="text-warn" />}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-muted">{project.description}</span>
        </span>
        <span className="hidden w-28 shrink-0 lg:block">
          <ProgressBar value={project.progress} height={4} />
        </span>
        <span className="hidden shrink-0 md:block">
          <AvatarGroup users={members} max={3} size="xs" />
        </span>
        <span className="hidden w-28 shrink-0 text-right text-[12px] text-faint sm:block">
          {timeAgo(project.updatedAt)}
        </span>
        {menu}
      </Link>
    );
  }

  return (
    <div className="group cs-surface cs-glow-hover relative flex flex-col overflow-hidden">
      <span
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)` }}
      />
      <div className="flex items-start gap-3 p-5 pb-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line transition-transform duration-200 group-hover:scale-105"
          style={{ color: project.accent }}
        >
          <Icon name="folder" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/projects/${project._id}`}
              className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-ink hover:text-accent"
            >
              {project.name}
            </Link>
            {project.starred && <Icon name="star" size={12} filled className="shrink-0 text-warn" />}
          </div>
          <p className="mt-0.5 text-[12px] text-faint">
            {owner ? `@${owner.username}` : 'Unknown owner'} · updated {timeAgo(project.updatedAt)}
          </p>
        </div>
        {menu}
      </div>

      <p className="line-clamp-2 px-5 text-[13px] leading-relaxed text-muted">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 px-5 pt-3.5">
        {project.techStack.slice(0, 3).map((tech) => (
          <span key={tech} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
            {tech}
          </span>
        ))}
        {project.techStack.length > 3 && (
          <span className="rounded-md px-1 py-0.5 text-[11px] text-faint">+{project.techStack.length - 3}</span>
        )}
      </div>

      <div className="px-5 pt-4">
        <ProgressBar value={project.progress} showLabel height={5} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
        <AvatarGroup users={members} max={3} size="xs" />
        <div className="flex items-center gap-2">
          <Badge icon="note">{project.counts.notes}</Badge>
          <Badge icon="file">{project.counts.files}</Badge>
          <VisibilityBadge visibility={project.visibility} />
        </div>
      </div>
    </div>
  );
}

export function ProjectCardCompact({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 transition-colors hover:border-lineStrong"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line"
        style={{ color: project.accent }}
      >
        <Icon name="folder" size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">{project.name}</span>
        <span className="block text-[11.5px] text-faint">{timeAgo(project.updatedAt)}</span>
      </span>
      <StatusBadge status={project.status} />
    </Link>
  );
}
