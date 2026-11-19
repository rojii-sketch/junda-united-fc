import { Monitor, Moon, Sun } from 'lucide-react';

const choices = [
  ['light', 'Light', 'Use a bright workspace.', Sun],
  ['dark', 'Dark', 'Use a low-light workspace.', Moon],
  ['system', 'System', 'Follow this device’s appearance.', Monitor]
];

export default function AdminAppearance({ preference, choosePreference }) {
  return (
    <section className="admin-form admin-appearance" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading">Workspace theme</h2>
      <p>Your preference is saved in this browser for the admin workspace and sign-in screen.</p>
      <fieldset>
        <legend>Color theme</legend>
        <div className="admin-appearance__options">
          {choices.map(([value, label, description, Icon]) => (
            <label className="admin-appearance__option" key={value}>
              <Icon size={22} aria-hidden="true" />
              <span><strong>{label}</strong><small id={`theme-${value}-hint`}>{description}</small></span>
              <input type="radio" name="admin-theme" value={value} checked={preference === value}
                aria-label={label} aria-describedby={`theme-${value}-hint`} onChange={() => choosePreference(value)} />
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
