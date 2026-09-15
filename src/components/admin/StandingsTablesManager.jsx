// src/components/admin/StandingsTablesManager.jsx
import { useState } from 'react';

const EMPTY_TABLE_FORM = { category: '', league: '', slug: '', displayOrder: 0 };
const EMPTY_TEAM_FORM = { rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W' };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const parseFormInput = (value) => (
  value ? value.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== '') : []
);

const normalizeTeamPayload = (form) => ({
  rank: Number(form.rank),
  name: form.name,
  p: Number(form.p) || 0,
  w: Number(form.w) || 0,
  d: Number(form.d) || 0,
  l: Number(form.l) || 0,
  gf: Number(form.gf) || 0,
  ga: Number(form.ga) || 0,
  pts: Number(form.pts) || 0,
  form: parseFormInput(form.formInput)
});

const upsertTableInList = (tables, savedTable) => {
  const exists = tables.some(t => t._id === savedTable._id);
  const next = exists ? tables.map(t => t._id === savedTable._id ? savedTable : t) : [...tables, savedTable];
  return next.sort((a, b) => (a.displayOrder - b.displayOrder) || (new Date(a.createdAt) - new Date(b.createdAt)));
};

const upsertTeamInTable = (tables, tableId, savedTeam) => {
  return tables.map(table => {
    if (table._id !== tableId) return table;
    const exists = table.teams.some(team => team._id === savedTeam._id);
    const teams = (exists
      ? table.teams.map(team => team._id === savedTeam._id ? savedTeam : team)
      : [...table.teams, savedTeam]
    ).sort((a, b) => a.rank - b.rank);
    return { ...table, teams };
  });
};

const removeTableFromList = (tables, tableId) => tables.filter(t => t._id !== tableId);

const removeTeamFromTable = (tables, tableId, teamId) => (
  tables.map(table => table._id === tableId
    ? { ...table, teams: table.teams.filter(team => team._id !== teamId) }
    : table)
);

export default function StandingsTablesManager({
  standingsTables,
  standingsTablesStatus,
  setStandingsTables,
  API_BASE,
  getAuthHeaders,
  onRetryData,
  onAuthChange
}) {
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [tableForm, setTableForm] = useState({ ...EMPTY_TABLE_FORM });
  const [teamForm, setTeamForm] = useState({ ...EMPTY_TEAM_FORM });
  const [isSubmittingTable, setIsSubmittingTable] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const selectedTable = standingsTables.find(t => t._id === selectedTableId) || null;

  const handleSelectTable = (id) => {
    setSelectedTableId(id);
    setEditingTeam(null);
    setTeamForm({ ...EMPTY_TEAM_FORM });
  };

  const showFeedback = (type, message) => setFeedback({ type, message });

  const validateTableForm = (form) => {
    const fields = [
      { ok: Boolean(form.category && form.category.trim()), message: 'Category is required.' },
      { ok: Boolean(form.league && form.league.trim()), message: 'League is required.' },
      { ok: Boolean(form.slug && form.slug.trim()), message: 'Slug is required.' },
      { ok: Boolean(form.slug && slugPattern.test(form.slug)), message: 'Slug must be lowercase letters, numbers, and hyphens only.' },
      { ok: Number.isInteger(Number(form.displayOrder)) && Number(form.displayOrder) >= 0, message: 'Display order must be a non-negative integer.' }
    ];
    const invalid = fields.find(field => !field.ok);
    if (invalid) return invalid.message;
    return null;
  };

  const validateTeamForm = (form) => {
    const stats = ['p', 'w', 'd', 'l', 'gf', 'ga', 'pts'];
    const fields = [
      { ok: Boolean(form.name && form.name.trim()), message: 'Team name is required.' },
      { ok: Number.isInteger(Number(form.rank)) && Number(form.rank) >= 1, message: 'Rank must be an integer of at least 1.' },
      ...stats.map(stat => ({
        ok: Number.isInteger(Number(form[stat])) && Number(form[stat]) >= 0,
        message: `${stat.toUpperCase()} must be a non-negative integer.`
      })),
      {
        ok: parseFormInput(form.formInput).every(result => ['W', 'D', 'L'].includes(result)),
        message: 'Form must only contain W, D, or L.'
      }
    ];
    const invalid = fields.find(field => !field.ok);
    if (invalid) return invalid.message;
    return null;
  };

  const parseError = async (response) => {
    try {
      const data = await response.json();
      return data?.error || data?.message || 'Request failed.';
    } catch {
      return 'Request failed.';
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (isSubmittingTable) return;

    const validationError = validateTableForm(tableForm);
    if (validationError) return alert(validationError);

    const payload = {
      category: tableForm.category.trim(),
      league: tableForm.league.trim(),
      slug: tableForm.slug.trim(),
      displayOrder: Number(tableForm.displayOrder)
    };

    setIsSubmittingTable(true);
    try {
      const res = await fetch(`${API_BASE}/standings-tables`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        if (res.status === 409) return alert('A standings table with this slug already exists.');
        return alert(message);
      }
      const savedTable = await res.json();
      setStandingsTables(tables => upsertTableInList(tables, savedTable));
      setSelectedTableId(savedTable._id);
      setTableForm({ ...EMPTY_TABLE_FORM });
      showFeedback('success', 'Standings table created.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setIsSubmittingTable(false);
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (isSubmittingTable || !editingTableId) return;

    const validationError = validateTableForm(tableForm);
    if (validationError) return alert(validationError);

    const payload = {
      category: tableForm.category.trim(),
      league: tableForm.league.trim(),
      slug: tableForm.slug.trim(),
      displayOrder: Number(tableForm.displayOrder)
    };

    setIsSubmittingTable(true);
    try {
      const res = await fetch(`${API_BASE}/standings-tables/${editingTableId}`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        if (res.status === 409) return alert('A standings table with this slug already exists.');
        return alert(message);
      }
      const updatedTable = await res.json();
      setStandingsTables(tables => upsertTableInList(tables, updatedTable));
      setEditingTableId(null);
      setTableForm({ ...EMPTY_TABLE_FORM });
      showFeedback('success', 'Standings table updated.');
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setIsSubmittingTable(false);
    }
  };

  const startEditTable = (item) => {
    setEditingTableId(item._id);
    setTableForm({ category: item.category, league: item.league, slug: item.slug, displayOrder: item.displayOrder });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditTable = () => {
    setEditingTableId(null);
    setTableForm({ ...EMPTY_TABLE_FORM });
  };

  const handleDeleteTable = async (item) => {
    const key = `table:${item._id}`;
    if (deletingKey === key) return;
    if (!window.confirm(`Delete the standings table "${item.category} — ${item.league}" and all its teams?`)) return;

    setDeletingKey(key);
    try {
      const res = await fetch(`${API_BASE}/standings-tables/${item._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(true)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        return alert(message);
      }
      setStandingsTables(tables => removeTableFromList(tables, item._id));
      if (selectedTableId === item._id) {
        setSelectedTableId(null);
        setEditingTeam(null);
        setTeamForm({ ...EMPTY_TEAM_FORM });
      }
      if (editingTableId === item._id) cancelEditTable();
      showFeedback('success', 'Standings table removed.');
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setDeletingKey(null);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (isSubmittingTeam || !selectedTableId) return;

    const validationError = validateTeamForm(teamForm);
    if (validationError) return alert(validationError);

    const payload = normalizeTeamPayload(teamForm);

    setIsSubmittingTeam(true);
    try {
      const tableId = selectedTableId;
      const res = await fetch(`${API_BASE}/standings-tables/${tableId}/teams`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        return alert(message);
      }
      const savedTeam = await res.json();
      setStandingsTables(tables => upsertTeamInTable(tables, tableId, savedTeam));
      setTeamForm({ ...EMPTY_TEAM_FORM });
      showFeedback('success', 'Team saved.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const startEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      rank: team.rank,
      name: team.name,
      p: team.p ?? 0,
      w: team.w ?? 0,
      d: team.d ?? 0,
      l: team.l ?? 0,
      gf: team.gf ?? 0,
      ga: team.ga ?? 0,
      pts: team.pts ?? 0,
      formInput: Array.isArray(team.form) ? team.form.join(',') : (team.form || '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditTeam = () => {
    setEditingTeam(null);
    setTeamForm({ ...EMPTY_TEAM_FORM });
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (isSubmittingTeam || !editingTeam || !selectedTableId) return;

    const validationError = validateTeamForm(teamForm);
    if (validationError) return alert(validationError);

    const payload = normalizeTeamPayload(teamForm);

    setIsSubmittingTeam(true);
    try {
      const tableId = selectedTableId;
      const res = await fetch(`${API_BASE}/standings-tables/${tableId}/teams/${editingTeam._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        return alert(message);
      }
      const savedTeam = await res.json();
      setStandingsTables(tables => upsertTeamInTable(tables, tableId, savedTeam));
      setEditingTeam(null);
      setTeamForm({ ...EMPTY_TEAM_FORM });
      showFeedback('success', 'Team updated.');
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!selectedTableId) return;
    const key = `team:${selectedTableId}:${team._id}`;
    if (deletingKey === key) return;
    if (!window.confirm(`Delete "${team.name}" from this standings table?`)) return;

    setDeletingKey(key);
    try {
      const tableId = selectedTableId;
      const res = await fetch(`${API_BASE}/standings-tables/${tableId}/teams/${team._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(true)
      });
      if (!res.ok) {
        if (res.status === 401) {
          onAuthChange?.(false);
          return alert('Access Denied. Your session has expired. Please log in again.');
        }
        const message = await parseError(res);
        return alert(message);
      }
      setStandingsTables(tables => removeTeamFromTable(tables, tableId, team._id));
      if (editingTeam && editingTeam._id === team._id) cancelEditTeam();
      showFeedback('success', 'Team removed.');
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    } finally {
      setDeletingKey(null);
    }
  };

  const isDeleting = (key) => deletingKey === key;

  const asyncButtonContent = (busy, busyText, idleText) =>
    busy ? (<><span className="btn-spinner" aria-hidden="true" />{busyText}</>) : idleText;

  const isEditingTable = Boolean(editingTableId);
  const isEditingTeam = Boolean(editingTeam);

  return (
    <div className="admin-panel admin-panel--stacked">
      {feedback && (
        <div className={`admin-feedback ${feedback.type === 'error' ? 'admin-feedback--error' : 'admin-feedback--info'}`} role="status">
          {feedback.message}
        </div>
      )}

      <form onSubmit={isEditingTable ? handleUpdateTable : handleCreateTable} className={`admin-form${isEditingTable ? ' admin-form--editing' : ''}`}>
        <h3>{isEditingTable ? "📝 Edit Standings Table" : "🆕 Create New Standings Table"}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="form-group" style={{ flex: '1 1 200px' }}><label htmlFor="st-category">Category</label><input id="st-category" type="text" placeholder="e.g. Senior Team" value={tableForm.category} onChange={e => setTableForm({ ...tableForm, category: e.target.value })} /></div>
          <div className="form-group" style={{ flex: '1 1 200px' }}><label htmlFor="st-league">League</label><input id="st-league" type="text" placeholder="e.g. FKF Mombasa County League" value={tableForm.league} onChange={e => setTableForm({ ...tableForm, league: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="form-group" style={{ flex: '2 1 220px' }}><label htmlFor="st-slug">Slug</label><input id="st-slug" type="text" placeholder="e.g. senior-team" value={tableForm.slug} onChange={e => setTableForm({ ...tableForm, slug: e.target.value })} /></div>
          <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="st-display">Display Order</label><input id="st-display" type="number" min="0" value={tableForm.displayOrder} onChange={e => setTableForm({ ...tableForm, displayOrder: e.target.value })} /></div>
        </div>
        <button type="submit" className="submit-btn submit-btn--success" disabled={isSubmittingTable}>
          {asyncButtonContent(isSubmittingTable, "Saving...", isEditingTable ? "💾 Save Table" : "➕ Create Table")}
        </button>
        {isEditingTable && (
          <button type="button" className="cancel-btn" onClick={cancelEditTable}>Cancel Edit</button>
        )}
      </form>

      <div className="admin-list">
        <h3 className="admin-list__header">Existing Standings Tables ({standingsTables.length})</h3>
        {standingsTablesStatus !== 'success' && standingsTablesStatus !== 'error' && (
          <div className="admin-list__state" role="status"><span className="btn-spinner" aria-hidden="true" />Loading standings tables...</div>
        )}
        {standingsTablesStatus === 'error' && (
          <div className="admin-list__state admin-list__state--error">⚠️ Unable to load standings tables. {onRetryData && <button type="button" className="submit-btn" onClick={onRetryData} style={{ marginTop: '0.75rem', width: 'auto' }}>Try again</button>}</div>
        )}
        {standingsTablesStatus === 'success' && standingsTables.length === 0 && (
          <div className="admin-list__state">No standings tables yet. Create one above.</div>
        )}
        {standingsTables.map(item => (
          <div key={item._id} className="admin-list__row" style={selectedTableId === item._id ? { borderLeft: '4px solid #2b6cb0' } : undefined}>
            <div className="admin-list__info" style={{ cursor: 'pointer' }} onClick={() => handleSelectTable(item._id)}>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.category}</strong>
              <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.league} • Display order: {item.displayOrder} • {item.teams?.length || 0} teams</p>
            </div>
            <div className="admin-row-actions">
              <button type="button" className="tab-btn tab-btn--compact" onClick={() => handleSelectTable(item._id)}>{selectedTableId === item._id ? 'Selected' : 'Select'}</button>
              <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditTable(item)}>Edit</button>
              <button type="button" className="delete-btn" disabled={isDeleting(`table:${item._id}`)} onClick={() => handleDeleteTable(item)}>{asyncButtonContent(isDeleting(`table:${item._id}`), "Deleting...", "Delete")}</button>
            </div>
          </div>
        ))}
      </div>

      {selectedTable ? (
        <div className="admin-panel">
          <h3 style={{ marginBottom: '0.5rem' }}>Selected: {selectedTable.category} — {selectedTable.league}</h3>
          <form onSubmit={isEditingTeam ? handleUpdateTeam : handleAddTeam} className={`admin-form${isEditingTeam ? ' admin-form--editing' : ''}`}>
            <h3>{isEditingTeam ? "📝 Edit Team" : "➕ Add / Upsert Team"}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="st-team-rank">Pos (Rank)</label><input id="st-team-rank" type="number" min="1" value={teamForm.rank} onChange={e => setTeamForm({ ...teamForm, rank: e.target.value })} /></div>
              <div className="form-group" style={{ flex: '2 1 200px' }}><label htmlFor="st-team-name">Team Name</label><input id="st-team-name" type="text" placeholder="e.g. Junda United FC" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.5rem' }}>
              <div className="form-group"><label htmlFor="st-team-p">P</label><input id="st-team-p" type="number" value={teamForm.p} onChange={e => setTeamForm({ ...teamForm, p: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-w">W</label><input id="st-team-w" type="number" value={teamForm.w} onChange={e => setTeamForm({ ...teamForm, w: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-d">D</label><input id="st-team-d" type="number" value={teamForm.d} onChange={e => setTeamForm({ ...teamForm, d: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-l">L</label><input id="st-team-l" type="number" value={teamForm.l} onChange={e => setTeamForm({ ...teamForm, l: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-gf">GF</label><input id="st-team-gf" type="number" value={teamForm.gf} onChange={e => setTeamForm({ ...teamForm, gf: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-ga">GA</label><input id="st-team-ga" type="number" value={teamForm.ga} onChange={e => setTeamForm({ ...teamForm, ga: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="st-team-pts">Pts</label><input id="st-team-pts" type="number" value={teamForm.pts} onChange={e => setTeamForm({ ...teamForm, pts: e.target.value })} style={{ fontWeight: 'bold' }} /></div>
            </div>
            <div className="form-group"><label htmlFor="st-team-form">Form History (Comma separated)</label><input id="st-team-form" type="text" placeholder="W,W,D,L,W" value={teamForm.formInput} onChange={e => setTeamForm({ ...teamForm, formInput: e.target.value })} /></div>
            <button type="submit" className="submit-btn submit-btn--success" disabled={isSubmittingTeam}>
              {asyncButtonContent(isSubmittingTeam, "Saving...", isEditingTeam ? "💾 Save Team" : "➕ Save Team")}
            </button>
            {isEditingTeam && (
              <button type="button" className="cancel-btn" onClick={cancelEditTeam}>Cancel Edit</button>
            )}
          </form>

          <div className="admin-list">
            <h3 className="admin-list__header">Teams ({selectedTable.teams?.length || 0})</h3>
            {selectedTable.teams?.length === 0 && (
              <div className="admin-list__state">No teams in this table yet. Add one above.</div>
            )}
            {(selectedTable.teams || []).map(team => (
              <div className="admin-list__row" key={team._id} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="admin-list__info">
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Pos {team.rank}. {team.name}</strong>
                  <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>
                    P {team.p} • W {team.w} • D {team.d} • L {team.l} • GF {team.gf} • GA {team.ga} • Points: <span style={{ fontWeight: 'bold', color: '#166534' }}>{team.pts}</span>
                    <span style={{ display: 'inline-flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                      {(team.form || []).map(result => <span className="role-tag" key={`${team._id}-${result}`}>{result}</span>)}
                    </span>
                  </p>
                </div>
                <div className="admin-row-actions">
                  <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditTeam(team)}>Edit</button>
                  <button type="button" className="delete-btn" disabled={isDeleting(`team:${selectedTable._id}:${team._id}`)} onClick={() => handleDeleteTeam(team)}>{asyncButtonContent(isDeleting(`team:${selectedTable._id}:${team._id}`), "Deleting...", "Delete")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-list__state">Select a standings table above to manage its teams.</div>
      )}
    </div>
  );
}