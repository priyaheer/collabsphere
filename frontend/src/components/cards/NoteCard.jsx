import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';
import { timeAgo } from '../../utils/format.js';
import { markdownExcerpt } from '../../utils/markdown.js';

export function NoteCard({ note, projectName }) {
  const author = note.author;

  return (
    <Link
      to={`/notes/${note._id}`}
      className="group cs-surface cs-glow-hover flex flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink group-hover:text-accent">
          {note.title}
        </h3>
        <Icon name={note.visibility === 'public' ? 'globe' : 'lock'} size={13} className="mt-1 shrink-0 text-faint" />
      </div>

      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">{markdownExcerpt(note.content, 160)}</p>

      {note.tags?.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge key={tag} icon="tag">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4 text-[11.5px] text-faint">
        <Avatar user={author} size="xs" />
        <span className="truncate">{author?.name}</span>
        <span>·</span>
        <span className="whitespace-nowrap">{timeAgo(note.updatedAt)}</span>
        {projectName && (
          <>
            <span>·</span>
            <span className="truncate">{projectName}</span>
          </>
        )}
      </div>
    </Link>
  );
}
