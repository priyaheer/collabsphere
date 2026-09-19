import React, { useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.js';

export function Dropdown({ trigger, items = [], align = 'right', width = 'w-56', header, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            'cs-modal-panel absolute z-[100] mt-2 origin-top animate-scale-in overflow-hidden rounded-xl border border-line p-1 shadow-lift',
            align === 'right' ? 'right-0' : 'left-0',
            width
          )}
        >
          {header && <div className="border-b border-line px-3 py-2.5">{header}</div>}
          {children ? (
            <div onClick={() => setOpen(false)}>{children}</div>
          ) : (
            items.map((item, i) =>
              item.divider ? (
                <div key={`d${i}`} className="my-1 h-px bg-line" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors',
                    item.tone === 'danger' ? 'text-danger hover:bg-raised' : 'text-muted hover:bg-raised hover:text-ink',
                    item.disabled && 'pointer-events-none opacity-40'
                  )}
                >
                  {item.icon && <Icon name={item.icon} size={15} />}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && <span className="text-[11px] text-faint">{item.shortcut}</span>}
                </button>
              )
            )
          )}
        </div>
      )}
    </div>
  );
}
