export default function RecordSearch({ id, label, query, onChange }) {
  return (
    <div className="form-group admin-search">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="search" value={query} onChange={event => onChange(event.target.value)} />
    </div>
  );
}
