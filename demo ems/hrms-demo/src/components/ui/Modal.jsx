import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: '440px',
    md: '540px',
    lg: '680px',
    xl: '900px',
  };

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.7)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWidths[size] ?? maxWidths.md,
          /* Use explicit height so flex children can fill + scroll */
          height: `min(calc(100vh - 32px), 780px)`,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'kiroModalIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
      >
        {/* Header — never scrolls */}
        <div
          style={{ flexShrink: 0, padding: '16px 24px' }}
          className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white m-0">
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent',
            }}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable, fills remaining space */}
        <div
          style={{
            flex: '1 1 0px',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 24px',
            WebkitOverflowScrolling: 'touch',
            /* Thin scrollbar */
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 transparent',
          }}
        >
          {children}
        </div>

        {/* Footer — never scrolls */}
        {footer && (
          <div
            style={{ flexShrink: 0, padding: '14px 24px' }}
            className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60"
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes kiroModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );

  /* Portal: renders directly into document.body,
     bypassing any overflow:hidden / transform in the layout tree */
  return createPortal(modal, document.body);
}
