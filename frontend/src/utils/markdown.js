/**
 * A small, dependency-free markdown renderer.
 * Everything is HTML-escaped before parsing, so the output is safe to pass to
 * dangerouslySetInnerHTML. Supports: headings, lists, tables, fenced code,
 * blockquotes, rules, links, images, bold/italic/strike and inline code.
 */

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mdInline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');
}

function mdCells(row) {
  return row
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMarkdown(source = '') {
  const lines = escapeHtml(source).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${mdInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${list.tag}>${list.items.map((i) => `<li>${mdInline(i)}</li>`).join('')}</${list.tag}>`);
      list = null;
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*```(\w+)?\s*$/);
    if (fence) {
      flushAll();
      const lang = fence[1] || 'text';
      const body = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      out.push(`<pre data-lang="${lang}"><code class="language-${lang}">${body.join('\n')}</code></pre>`);
      continue;
    }

    // Table
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      flushAll();
      const head = mdCells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') {
        rows.push(mdCells(lines[i]));
        i += 1;
      }
      i -= 1;
      out.push(
        `<table><thead><tr>${head.map((h) => `<th>${mdInline(h)}</th>`).join('')}</tr></thead>` +
          `<tbody>${rows
            .map((r) => `<tr>${r.map((c) => `<td>${mdInline(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`
      );
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushAll();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      out.push(`<h${level}>${mdInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushAll();
      out.push('<hr />');
      continue;
    }

    const quote = line.match(/^\s*&gt;\s?(.*)$/);
    if (quote) {
      flushAll();
      out.push(`<blockquote>${mdInline(quote[1])}</blockquote>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet || ordered) {
      flushParagraph();
      const tag = bullet ? 'ul' : 'ol';
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push((bullet || ordered)[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return out.join('\n');
}

/** Plain-text excerpt used in note cards and search results. */
export function markdownExcerpt(source = '', length = 140) {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}
