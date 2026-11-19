// Capture the list and trigger before the dialog opens. On success the
// trigger is removed, so move to a surviving action or the list heading.
export function afterRecordDeletion(trigger) {
  const list = trigger.closest('.admin-list');
  if (!list) return () => {};

  const actions = [...list.querySelectorAll('.admin-list__row .delete-btn')];
  const index = actions.indexOf(trigger);
  const candidates = [...actions.slice(index + 1), ...actions.slice(0, index).reverse()];

  return () => {
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!list.isConnected || (active !== document.body && active !== trigger)) return;

      const next = candidates.find(action => list.contains(action) && !action.disabled);
      (next ?? list.querySelector('.admin-list__header'))?.focus();
    });
  };
}
