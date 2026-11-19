import { useState, useSyncExternalStore } from 'react';

const preferenceKey = 'junda-admin-appearance';
const darkQuery = '(prefers-color-scheme: dark)';
const validPreferences = ['light', 'dark', 'system'];

function readPreference() {
  try {
    const saved = window.localStorage.getItem(preferenceKey);
    if (validPreferences.includes(saved)) return saved;
  } catch {
    // Appearance still works when browser storage is unavailable.
  }
  return 'system';
}

function subscribeToSystemTheme(listener) {
  const media = window.matchMedia(darkQuery);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

export default function useAdminTheme() {
  const [preference, setPreference] = useState(readPreference);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia(darkQuery).matches,
    () => false
  );

  function choosePreference(value) {
    if (!validPreferences.includes(value)) return;
    setPreference(value);
    try {
      window.localStorage.setItem(preferenceKey, value);
    } catch {
      // Keep the current choice for this visit.
    }
  }

  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  return { preference, theme, choosePreference };
}
