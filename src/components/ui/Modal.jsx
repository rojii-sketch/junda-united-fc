import { useEffect, useRef } from 'react';

export default function Modal({ children, className = '', label, descriptionId, onClose, onClick, onKeyDown }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  function keepFocusInside(event) {
    if (event.key !== 'Tab') return;
    const controls = event.currentTarget.querySelectorAll('button:not([disabled]), [tabindex="0"]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog ref={dialogRef} className={className} aria-label={label} aria-describedby={descriptionId} onClick={onClick} onKeyDown={event => { keepFocusInside(event); onKeyDown?.(event); }}
      onCancel={event => { event.preventDefault(); onClose(); }}>
      {children}
    </dialog>
  );
}
