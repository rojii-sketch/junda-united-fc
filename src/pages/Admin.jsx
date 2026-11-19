import { changeGalleryType, emptyGalleryDraft, galleryPayload, getGalleryUploadType, rememberGalleryUpload } from '../utils/galleryDraft';
import { afterRecordDeletion } from '../components/ui/deleteFocus';
// src/pages/Admin.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import RecordSearch from '../components/admin/RecordSearch';
import AdminOverview from '../components/admin/AdminOverview';
import AdminGalleryPreview from '../components/admin/AdminGalleryPreview';
import AdminNewsPreview from '../components/admin/AdminNewsPreview';
import Feedback from '../components/ui/Feedback';
import DeleteDialog from '../components/ui/DeleteDialog';
import { fixtureSchedule } from '../utils/fixtureInput';
import AdminLayout from '../components/layout/AdminLayout';
import SEO from '../components/SEO';
import { Pencil, Trash2, Upload } from 'lucide-react';
import StandingsTablesManager from '../components/admin/StandingsTablesManager';
import '../Admin.css';

export default function Admin({
  news, setNews,
  players, setPlayers,
  gallery, setGallery,
  fixtures, setFixtures,
  standings, setStandings,
  standingsTables, setStandingsTables,
  standingsTablesStatus,
  adminRequest,
  API_BASE,
  collectionStatuses,
  onRetryData,
  onAuthChange,
  sessionNotice
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loginMessage, setLoginMessage] = useState(sessionNotice);
  const [message, setMessage] = useState(null);
  const [deletion, setDeletion] = useState(null);
  const [newsQuery, setNewsQuery] = useState('');
  const [squadQuery, setSquadQuery] = useState('');
  const reportError = text => setMessage({ kind: 'error', text });
  const reportSuccess = text => setMessage({ kind: 'success', text });

  async function showRequestError(response, fallback) {
    const details = await response.json().catch(() => null);
    reportError(details?.error || details?.message || fallback);
  }

  // 🎯 JWT Authentication State
  const [adminToken] = useState(() => sessionStorage.getItem('junda_jwt'));

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🎯 NEW: Loading state for login verification
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '', date: '' });
  const [playerForm, setPlayerForm] = useState({
    name: '', position: '', jerseyNumber: '', role: 'player', image: '',
    age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: ''
  });
  const [galleryForm, setGalleryForm] = useState(emptyGalleryDraft);
  const [uploadedMediaTypes, setUploadedMediaTypes] = useState(() => new Map());
  const [fixtureForm, setFixtureForm] = useState({
    opponent: '', matchDate: '', kickoffTime: '16:00', venue: 'Junda Grounds, Mishomoroni',
    status: 'Upcoming', jundaScore: 0, opponentScore: 0, isHomeMatch: true
  });
  const [standingForm, setStandingForm] = useState({
    rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingFixture, setIsSubmittingFixture] = useState(false);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);
  const [isSubmittingStanding, setIsSubmittingStanding] = useState(false);
  const [deletingItemKey, setDeletingItemKey] = useState(null);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingStandingId, setEditingStandingId] = useState(null);

  // 🎯 Sub-view toggle within the Standings tab (legacy single table vs multi-standings tables)
  const [standingsSubview, setStandingsSubview] = useState('tables');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isLoggingIn) return;
    setLoginMessage(null);

    // 🎯 Trigger the loading animation
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onAuthChange?.(true, null, data.token);
      } else {
        setLoginMessage({ kind: 'error', text: data.message || data.error || 'Check your username and password, then try again.' });
        setPasswordInput('');
      }
    } catch (err) {
      console.error(err);
      setLoginMessage({ kind: 'error', text: 'Could not reach the sign-in service. Check your connection and try again.' });
    } finally {
      // 🎯 Turn off the loading animation regardless of success or failure
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => onAuthChange(false);

  const handleFileUpload = async (e, formType) => {
    if (isUploading) return;
    setMessage(null);
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      reportError('Choose a JPEG, PNG, WebP or GIF image up to 10 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await adminRequest('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUploadedMediaTypes(current => {
          const next = new Map(current);
          rememberGalleryUpload(next, data.url, 'image');
          return next;
        });
        if (formType === 'news') setNewsForm(current => ({ ...current, imageUrl: data.url }));
        if (formType === 'squad') setPlayerForm(current => ({ ...current, image: data.url }));
        if (formType === 'gallery') setGalleryForm(current => ({ ...current, url: data.url, urlType: 'image' }));
        reportSuccess('Image uploaded. Save the form to publish it.');
      } else {
        reportError(data.error || data.message || 'Could not upload the image. Try again.');
      }
    } catch (err) {
      console.error(err);
      reportError('Error uploading file to server.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (isSubmittingNews || isUploading) return;
    setMessage(null);
    if (!newsForm.title.trim() || !newsForm.content.trim()) return reportError('Title and Content are required!');

    setIsSubmittingNews(true);

    try {
      if (editingNewsId) {
        const updatePayload = { title: newsForm.title, content: newsForm.content, imageUrl: newsForm.imageUrl, date: newsForm.date };
        const response = await adminRequest(`/news/${editingNewsId}`, {
          method: 'PUT',
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setNews(current => current.map(item => item._id === editingNewsId ? updatedItem : item));
          setEditingNewsId(null);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          reportSuccess('Article updated.');
        } else {
          await showRequestError(response, 'Could not update the article.');
        }
      } else {
        const newArticle = { title: newsForm.title, content: newsForm.content, imageUrl: newsForm.imageUrl, date: newsForm.date || new Date().toISOString().split('T')[0] };
        const response = await adminRequest('/news', {
          method: 'POST',
          body: JSON.stringify(newArticle)
        });

        if (response.ok) {
          const savedArticle = await response.json();
          setNews(current => [savedArticle, ...current]);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          reportSuccess('Article published.');
        } else await showRequestError(response, 'Could not publish the article.');
      }
    } catch (err) {
      console.error(err);
      reportError(editingNewsId ? 'Failed to update article.' : 'Failed to save article.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  const startEditNews = (item) => {
    setEditingNewsId(item._id);
    setNewsForm({ title: item.title, content: item.content, imageUrl: item.imageUrl || '', date: item.date || '' });
    requestAnimationFrame(() => document.querySelector('.admin-form--editing input')?.focus());
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (isSubmittingPlayer || isUploading) return;
    setMessage(null);
    if (!playerForm.name.trim() || !playerForm.position.trim()) return reportError('Name and Position are required!');

    setIsSubmittingPlayer(true);

    try {
      if (editingPlayerId) {
        const response = await adminRequest(`/players/${editingPlayerId}`, {
          method: 'PUT',
          body: JSON.stringify(playerForm)
        });
        if (response.ok) {
          const updatedPlayer = await response.json();
          setPlayers(current => current.map(p => p._id === editingPlayerId ? updatedPlayer : p));
          setEditingPlayerId(null);
          setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '', age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: '' });
          reportSuccess('Squad member updated.');
        } else await showRequestError(response, 'Could not update the squad member.');
      } else {
        const response = await adminRequest('/players', {
          method: 'POST',
          body: JSON.stringify(playerForm)
        });
        if (response.ok) {
          const savedPlayer = await response.json();
          setPlayers(current => [...current, savedPlayer]);
          setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '', age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: '' });
          reportSuccess('Squad member added.');
        } else await showRequestError(response, 'Could not add the squad member.');
      }
    } catch (err) {
      console.error(err);
      reportError(editingPlayerId ? 'Failed to update roster member.' : 'Failed to add roster member.');
    } finally {
      setIsSubmittingPlayer(false);
    }
  };

  const startEditPlayer = (item) => {
    setEditingPlayerId(item._id);
    setPlayerForm({
      name: item.name, position: item.position, jerseyNumber: item.jerseyNumber || '', role: item.role,
      image: item.image || '', age: item.age || '', squadCategory: item.squadCategory || 'First Team',
      appearances: item.appearances || 0, goals: item.goals || 0, bio: item.bio || '', contact: item.contact || ''
    });
    requestAnimationFrame(() => document.querySelector('.admin-form--editing input')?.focus());
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (isSubmittingGallery || isUploading) return;
    setMessage(null);
    let payload;
    try {
      payload = galleryPayload(galleryForm, uploadedMediaTypes);
    } catch (error) {
      return reportError(error.message);
    }

    setIsSubmittingGallery(true);
    try {
      const response = await adminRequest('/gallery', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const savedMedia = await response.json();
        setGallery(current => [...current, savedMedia]);
        setGalleryForm(emptyGalleryDraft);
        reportSuccess('Gallery item published.');
      } else await showRequestError(response, 'Could not publish the gallery item.');
    } catch (err) {
      console.error(err);
      reportError('Failed to save gallery asset.');
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handleAddFixture = async (e) => {
    e.preventDefault();
    if (isSubmittingFixture) return;
    setMessage(null);
    if (!fixtureForm.opponent.trim() || !fixtureForm.matchDate || !fixtureForm.kickoffTime) return reportError('Enter an opponent, match date and kickoff time.');
    const submissionPayload = {
      ...fixtureForm,
      ...fixtureSchedule(fixtureForm.matchDate, fixtureForm.kickoffTime),
      jundaScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.jundaScore) : 0,
      opponentScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.opponentScore) : 0,
    };

    setIsSubmittingFixture(true);
    try {
      const response = await adminRequest('/fixtures', {
        method: 'POST',
        body: JSON.stringify(submissionPayload)
      });
      if (response.ok) {
        const savedFixture = await response.json();
        setFixtures(current => [savedFixture, ...current]);
        setFixtureForm({ opponent: '', matchDate: '', kickoffTime: '16:00', venue: 'Junda Grounds, Mishomoroni', status: 'Upcoming', jundaScore: 0, opponentScore: 0, isHomeMatch: true });
        reportSuccess('Match saved.');
      } else await showRequestError(response, 'Could not save the match.');
    } catch (err) {
      console.error(err);
      reportError('Failed to record fixture details.');
    } finally {
      setIsSubmittingFixture(false);
    }
  };

  const handleStandingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingStanding) return;
    setMessage(null);
    if (!standingForm.name) return reportError('Club Name is required!');
    const parsedForm = standingForm.formInput ? standingForm.formInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "") : [];
    const payload = {
      name: standingForm.name, rank: Number(standingForm.rank) || 1, p: Number(standingForm.p) || 0,
      w: Number(standingForm.w) || 0, d: Number(standingForm.d) || 0, l: Number(standingForm.l) || 0,
      gf: Number(standingForm.gf) || 0, ga: Number(standingForm.ga) || 0, pts: Number(standingForm.pts) || 0, form: parsedForm
    };

    setIsSubmittingStanding(true);
    try {
      const res = await adminRequest(editingStandingId ? `/standings/${editingStandingId}` : '/standings', {
        method: editingStandingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        reportError(errorData.error || errorData.message || 'Could not save the standings row.');
        return;
      }
      const savedTeam = await res.json();
      if (editingStandingId) {
        setStandings((standings || []).map(t => t._id === editingStandingId ? savedTeam : t).sort((a,b) => a.rank - b.rank));
      } else {
        const matchesTeamName = (team) => team.name.toLowerCase() === savedTeam.name.toLowerCase();
        const existingIdx = (standings || []).findIndex(matchesTeamName);
        if (existingIdx > -1) {
          setStandings(standings.map(t => matchesTeamName(t) ? savedTeam : t).sort((a,b) => a.rank - b.rank));
        } else {
          setStandings([...(standings || []), savedTeam].sort((a,b) => a.rank - b.rank));
        }
      }
      setStandingForm({ rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W' });
      if (editingStandingId) setEditingStandingId(null);
      reportSuccess('Legacy standings row saved.');
    } catch (err) {
      console.error(err);
      reportError('Network error communicating with the server.');
    } finally {
      setIsSubmittingStanding(false);
    }
  };

  const startEditStanding = (item) => {
    setEditingStandingId(item._id);
    setStandingForm({
      rank: item.rank,
      name: item.name,
      p: item.p ?? 0,
      w: item.w ?? 0,
      d: item.d ?? 0,
      l: item.l ?? 0,
      gf: item.gf ?? 0,
      ga: item.ga ?? 0,
      pts: item.pts ?? 0,
      formInput: Array.isArray(item.form) ? item.form.join(',') : (item.form || '')
    });
    requestAnimationFrame(() => document.querySelector('.admin-form--editing input')?.focus());
  };

  const deleteItem = async (id, type, restoreFocus) => {
    const key = `${type}:${id}`;
    if (deletingItemKey) return;
    setMessage(null);
    setDeletingItemKey(key);

    try {
      const response = await adminRequest(`/${type}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (type === 'news') { setNews(current => current.filter(item => item._id !== id)); if (editingNewsId === id) setEditingNewsId(null); }
        if (type === 'players') { setPlayers(current => current.filter(item => item._id !== id)); if (editingPlayerId === id) setEditingPlayerId(null); }
        if (type === 'gallery') setGallery(current => current.filter(item => item._id !== id));
        if (type === 'fixtures') setFixtures(current => current.filter(item => item._id !== id));
        if (type === 'standings') { setStandings(current => current.filter(item => item._id !== id)); if (editingStandingId === id) setEditingStandingId(null); }
        reportSuccess('Item deleted.');
        restoreFocus();
      } else {
        await showRequestError(response, 'Could not delete the item.');
      }
    } catch (err) {
      console.error(err);
      reportError('Failed to drop record from backend.');
    } finally {
      setDeletingItemKey(null);
    }
  };

  if (!adminToken) {
    return (
      <main className="club-admin-login">
        <SEO title="Club administration" description="Junda United FC administration sign-in." />
        <form onSubmit={handleLogin} className="admin-form">
          <Link to="/" className="club-admin-login__back">← Return to club website</Link>
          <img src="/junda-logo.webp" width="72" height="72" alt="" />
          <h1>Club administration</h1>
          <p>Sign in to manage the Junda United FC website.</p>
          <Feedback message={loginMessage} />
          <div className="form-group">
            <label htmlFor="admin-login-username">Username</label>
            <input id="admin-login-username" name="username" autoComplete="username" required value={usernameInput} onChange={e => setUsernameInput(e.target.value)} disabled={isLoggingIn} />
          </div>
          <div className="form-group">
            <label htmlFor="admin-login-password">Password</label>
            <div className="club-password">
              <input id="admin-login-password" name="password" autoComplete="current-password" required type={showPassword ? 'text' : 'password'} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} disabled={isLoggingIn} />
              <button type="button" className="edit-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(current => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={isLoggingIn}>{isLoggingIn ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </main>
    );
  }

  // Determine section title and description based on activeTab
  const sectionConfigs = {
    overview: { title: 'Club overview', description: 'Manage club content, match schedules and results.' },
    news: { title: 'Manage News', description: 'Create, update and remove club articles in real-time.' },
    fixtures: { title: 'Manage Fixtures', description: 'Log and track match schedules and results.' },
    standings: { title: 'Manage Standings', description: 'Manage competition tables and enter team statistics.' },
    squad: { title: 'Manage Squad', description: 'Handle player registrations, staff records and team roster.' },
    gallery: { title: 'Manage Gallery', description: 'Upload and organize media assets for club communications.' }
  };

  const { title: sectionTitle, description: sectionDescription } = sectionConfigs[activeTab] || { title: 'Admin Dashboard', description: 'Club management dashboard' };

  const handleSelectSection = (tab) => {
    setActiveTab(tab);
    setMessage(null);
  };

  const confirmDelete = (item, type, trigger) => {
    if (deletingItemKey) return;
    const name = item.title || item.name || item.opponent || item.caption || 'this media item';
    const restoreFocus = afterRecordDeletion(trigger);
    setDeletion({ question: `Permanently delete ${name}?`, run: () => deleteItem(item._id, type, restoreFocus) });
  };

  const isDeleting = (type, id) => deletingItemKey === `${type}:${id}`;

  const asyncButtonContent = (busy, busyText, idleText) =>
    busy ? (<><span className="btn-spinner" aria-hidden="true" />{busyText}</>) : idleText;

  const statusOf = (key) => (collectionStatuses || {})[key] || 'idle';

  const renderListState = (status, label, emptyMessage) => {
    if (status !== 'success' && status !== 'error') {
      return (
        <div className="admin-list__state" role="status">
          <span className="btn-spinner" aria-hidden="true" />Loading {label}...
        </div>
      );
    }
    if (status === 'error') {
      return <div className="admin-list__state admin-list__state--error">⚠️ Unable to load {label}. Use “Try again” above.</div>;
    }
    return <div className="admin-list__state">
      <p>{emptyMessage}</p>
      <button type="button" className="edit-btn" onClick={event => event.currentTarget.closest('.admin-panel')?.querySelector('form input')?.focus()}>
        Go to entry form
      </button>
    </div>;
  };

  const loadingCollections = Object.entries(collectionStatuses || {})
    .filter(([, status]) => status === 'loading')
    .map(([collection]) => collection);
  const shownNews = news.filter(item => item.title?.toLowerCase().includes(newsQuery.trim().toLowerCase()));
  const shownSquad = players.filter(item => [item.name, item.position, item.squadCategory, item.role === 'coach' ? 'staff' : 'player']
    .some(value => value?.toLowerCase().includes(squadQuery.trim().toLowerCase())));
  const failedCollections = Object.entries(collectionStatuses || {})
    .filter(([, status]) => status === 'error')
    .map(([collection]) => collection);

  return (
    <AdminLayout
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      activeTab={activeTab}
      onSelectSection={handleSelectSection}
      onLogout={handleLogout}
    >
      <div className="club-admin-content">
        <SEO title={sectionTitle} description={sectionDescription} />
        <DeleteDialog request={deletion} onCancel={() => setDeletion(null)} />
        <Feedback message={message} />
        {activeTab === 'overview' && (
          <AdminOverview onSelect={handleSelectSection} fixtures={fixtures} fixtureStatus={statusOf('fixtures')}
            collections={Object.fromEntries([
              ['news', 'news', news], ['fixtures', 'fixtures', fixtures], ['standings', 'standingsTables', standingsTables],
              ['squad', 'players', players], ['gallery', 'gallery', gallery]
            ].map(([section, collection, rows]) => [section, statusOf(collection) === 'success' ? rows.length : undefined]))} />
        )}

        {isUploading && (
          <div className="admin-feedback admin-feedback--loading" role="status">
            <span className="btn-spinner" aria-hidden="true" />Uploading image…
          </div>
        )}

        {(loadingCollections.length > 0 || failedCollections.length > 0) && (
          <div className={`admin-feedback ${failedCollections.length > 0 ? 'admin-feedback--error' : 'admin-feedback--loading'}`}>
            {loadingCollections.length > 0 && (
              <div><span className="btn-spinner" aria-hidden="true" />Loading {loadingCollections.join(', ')}...</div>
            )}
            {failedCollections.length > 0 && (
              <>
                <div>Unable to load: {failedCollections.join(', ')}.</div>
                {onRetryData && (
                  <button type="button" className="submit-btn" onClick={onRetryData} style={{ marginTop: '0.75rem', width: 'auto' }}>
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* --- NEWS SECTION --- */}
        {activeTab === 'news' && (
          <div className="admin-panel admin-panel--stacked">
            <form onSubmit={handleAddNews} className={`admin-form${editingNewsId ? ' admin-form--editing' : ''}`}>
              <h3>{editingNewsId ? "Edit article" : "Create article"}</h3>
              <div className="form-group"><label htmlFor="admin-news-title">Article Title</label><input id="admin-news-title" required type="text" aria-describedby="admin-news-title-hint" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} /><small id="admin-news-title-hint">Write a clear headline that tells readers what happened.</small></div>
              <div className="form-group"><label htmlFor="admin-news-image">Cover image (optional)</label><input id="admin-news-image" aria-describedby="admin-news-image-hint" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploading} onChange={e => handleFileUpload(e, 'news')} /><small id="admin-news-image-hint">Use a JPG, PNG, WebP or GIF up to 10 MB. A landscape photo works well in the news grid.</small></div>
              <div className="form-group"><label htmlFor="admin-news-date">Publication date (optional)</label><input id="admin-news-date" aria-describedby="admin-news-date-hint" type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} /><small id="admin-news-date-hint">{editingNewsId ? 'Choose a date to change the saved publication date.' : 'A new article uses the current date if left blank.'}</small></div>
              <div className="form-group"><label htmlFor="admin-news-content">Article Content</label><textarea id="admin-news-content" required aria-describedby="admin-news-content-hint" rows="8" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea><small id="admin-news-content-hint">Leave a blank line between paragraphs.</small></div>
              <AdminNewsPreview draft={newsForm} />
              <button type="submit" className="submit-btn" disabled={isSubmittingNews || isUploading}>{asyncButtonContent(isSubmittingNews, editingNewsId ? "Saving..." : "Publishing...", editingNewsId ? "Save Changes" : "Publish Post")}</button>
              {editingNewsId && (
                <button type="button" className="cancel-btn" onClick={() => { setEditingNewsId(null); setNewsForm({ title: '', content: '', imageUrl: '', date: '' }); }}>Cancel Edit</button>
              )}
            </form>

            <div className="admin-list">
              <h3 className="admin-list__header" tabIndex={-1}>Current Articles ({news.length})</h3>
              {news.length > 0 && <RecordSearch id="news-search" label="Search articles" query={newsQuery} onChange={setNewsQuery} />}
              {news.length > 0 && shownNews.length === 0 && <p className="admin-list__state" role="status">No articles match your search.</p>}
              {shownNews.map(item => (
                <div key={item._id} className="admin-list__row">
                  <div className="admin-list__info">
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.date}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditNews(item)}><Pencil size={16} aria-hidden="true" /> Edit</button>
                    <button type="button" className="delete-btn" disabled={isDeleting('news', item._id)} onClick={event => confirmDelete(item, 'news', event.currentTarget)}>{asyncButtonContent(isDeleting('news', item._id), "Deleting…", <><Trash2 size={16} aria-hidden="true" /> Delete</>)}</button>
                  </div>
                </div>
                ))}
              {news.length === 0 && renderListState(statusOf('news'), 'articles', 'No articles published yet.')}
            </div>
          </div>
        )}

        {/* --- FIXTURES SECTION --- */}
        {activeTab === 'fixtures' && (
          <div className="admin-panel admin-panel--stacked">
            <form onSubmit={handleAddFixture} className="admin-form">
              <h3>Add a match</h3>
              <div className="form-group"><label htmlFor="admin-fixture-opponent">Opponent Team Name</label><input id="admin-fixture-opponent" required type="text" placeholder="e.g. Black Dragon FC" value={fixtureForm.opponent} onChange={e => setFixtureForm({...fixtureForm, opponent: e.target.value})} /></div>
              <div className="form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 150px' }}><label htmlFor="admin-fixture-date">Match Date</label><input id="admin-fixture-date" type="date" required value={fixtureForm.matchDate} onChange={e => setFixtureForm({...fixtureForm, matchDate: e.target.value})} /></div>
                <div style={{ flex: '1 1 150px' }}><label htmlFor="admin-fixture-time">Kickoff time (EAT)</label><input id="admin-fixture-time" type="time" required value={fixtureForm.kickoffTime} onChange={e => setFixtureForm({...fixtureForm, kickoffTime: e.target.value})} /></div>
              </div>
              <div className="form-group"><label htmlFor="admin-fixture-venue">Stadium Venue</label><input id="admin-fixture-venue" type="text" value={fixtureForm.venue} onChange={e => setFixtureForm({...fixtureForm, venue: e.target.value})} /></div>
              <div className="form-group" style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}><input type="checkbox" checked={fixtureForm.isHomeMatch} onChange={e => setFixtureForm({...fixtureForm, isHomeMatch: e.target.checked})} />Home match</label></div>
              <div className="form-group"><label htmlFor="admin-fixture-status">Match Progress Status</label><select id="admin-fixture-status" value={fixtureForm.status} onChange={e => setFixtureForm({...fixtureForm, status: e.target.value})}><option value="Upcoming">Upcoming</option><option value="Completed">Completed</option></select></div>
              {fixtureForm.status === 'Completed' && (
                <div className="form-group" style={{ display: 'flex', gap: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px' }}>
                  <div><label htmlFor="admin-fixture-junda">Junda Score</label><input id="admin-fixture-junda" type="number" min="0" step="any" value={fixtureForm.jundaScore} onChange={e => setFixtureForm({...fixtureForm, jundaScore: e.target.value})} style={{ width: '70px' }} /></div>
                  <div style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '1rem' }}>VS</div>
                  <div><label htmlFor="admin-fixture-opp-score">Opponent Score</label><input id="admin-fixture-opp-score" type="number" min="0" step="any" value={fixtureForm.opponentScore} onChange={e => setFixtureForm({...fixtureForm, opponentScore: e.target.value})} style={{ width: '70px' }} /></div>
                </div>
              )}
              <button type="submit" className="submit-btn" disabled={isSubmittingFixture}>{asyncButtonContent(isSubmittingFixture, "Saving...", "Save Match Entry")}</button>
            </form>

            <div className="admin-list">
              <h3 className="admin-list__header" tabIndex={-1}>Active Match Logs ({fixtures?.length || 0})</h3>
              {(fixtures || []).map(item => (
                <div key={item._id} className="admin-list__row">
                  <div className="admin-list__info">
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Junda United vs {item.opponent}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.matchDate} • {item.status === 'Completed' ? `Score: ${item.jundaScore}-${item.opponentScore}` : 'Upcoming'}</p>
                  </div>
                  <button type="button" className="delete-btn" disabled={isDeleting('fixtures', item._id)} onClick={event => confirmDelete(item, 'fixtures', event.currentTarget)}>{asyncButtonContent(isDeleting('fixtures', item._id), "Deleting…", <><Trash2 size={16} aria-hidden="true" /> Delete</>)}</button>
                </div>
              ))}
              {(!fixtures || fixtures.length === 0) && renderListState(statusOf('fixtures'), 'fixtures', 'No fixtures logged yet.')}
            </div>
          </div>
        )}

        {/* --- STANDINGS SECTION --- */}
        {activeTab === 'standings' && (
          <div className="admin-panel admin-panel--stacked">
            <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" className={standingsSubview === 'legacy' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStandingsSubview('legacy')} aria-pressed={standingsSubview === 'legacy'}>Legacy standings</button>
              <button type="button" className={standingsSubview === 'tables' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStandingsSubview('tables')} aria-pressed={standingsSubview === 'tables'}>Standings tables</button>
            </div>

            {standingsSubview === 'legacy' && (
            <>
            <p className="admin-field-note">The legacy table retains stored positions. Standings tables calculate position from points, goal difference and goals scored.</p>
            <form onSubmit={handleStandingSubmit} className={`admin-form${editingStandingId ? ' admin-form--editing' : ''}`}>
              <h3>{editingStandingId ? "📝 Edit Standings Row" : "📊 Update League Standings Table"}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="admin-stand-rank">Stored position (legacy table)</label><input id="admin-stand-rank" type="number" min="1" value={standingForm.rank} onChange={e => setStandingForm({...standingForm, rank: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '2 1 200px' }}><label htmlFor="admin-stand-name">Club Name</label><input id="admin-stand-name" type="text" placeholder="e.g. Junda United FC" value={standingForm.name} onChange={e => setStandingForm({...standingForm, name: e.target.value})} required /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.5rem' }}>
                <div className="form-group"><label htmlFor="admin-stand-p">P</label><input id="admin-stand-p" type="number" value={standingForm.p} onChange={e => setStandingForm({...standingForm, p: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-w">W</label><input id="admin-stand-w" type="number" value={standingForm.w} onChange={e => setStandingForm({...standingForm, w: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-d">D</label><input id="admin-stand-d" type="number" value={standingForm.d} onChange={e => setStandingForm({...standingForm, d: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-l">L</label><input id="admin-stand-l" type="number" value={standingForm.l} onChange={e => setStandingForm({...standingForm, l: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-gf">GF</label><input id="admin-stand-gf" type="number" value={standingForm.gf} onChange={e => setStandingForm({...standingForm, gf: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-ga">GA</label><input id="admin-stand-ga" type="number" value={standingForm.ga} onChange={e => setStandingForm({...standingForm, ga: e.target.value})} /></div>
                <div className="form-group"><label htmlFor="admin-stand-pts">Pts</label><input id="admin-stand-pts" type="number" value={standingForm.pts} onChange={e => setStandingForm({...standingForm, pts: e.target.value})} style={{ fontWeight: 'bold' }} /></div>
              </div>

              <div className="form-group"><label htmlFor="admin-stand-form">Form History (Comma separated)</label><input id="admin-stand-form" type="text" placeholder="W,W,D,L,W" value={standingForm.formInput} onChange={e => setStandingForm({...standingForm, formInput: e.target.value})} /></div>
              <button
                type="submit"
                className="submit-btn submit-btn--success"
                disabled={isSubmittingStanding}
              >
                {asyncButtonContent(isSubmittingStanding, "Saving...", editingStandingId ? "💾 Save Changes" : "💾 Save Team Metrics")}
              </button>
              {editingStandingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setEditingStandingId(null); setStandingForm({ rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W' }); }}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="admin-list">
              <h3 className="admin-list__header" tabIndex={-1}>Active League Table Rows ({standings?.length || 0})</h3>
              {(standings || []).map(team => (
                <div key={team._id} className="admin-list__row">
                  <div className="admin-list__info">
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Pos {team.rank}. {team.name}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>Points: <span style={{ fontWeight: 'bold', color: '#166534' }}>{team.pts}</span> • Record: P {team.p} W {team.w} D {team.d} L {team.l}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditStanding(team)}><Pencil size={16} aria-hidden="true" /> Edit</button>
                    <button type="button" className="delete-btn" disabled={isDeleting('standings', team._id)} onClick={event => confirmDelete(team, 'standings', event.currentTarget)}>{asyncButtonContent(isDeleting('standings', team._id), "Deleting…", <><Trash2 size={16} aria-hidden="true" /> Delete</>)}</button>
                  </div>
                </div>
              ))}
              {(!standings || standings.length === 0) && renderListState(statusOf('standings'), 'standings rows', 'No standings rows added yet.')}
            </div>
            </>
            )}

            {standingsSubview === 'tables' && (
              <StandingsTablesManager
                standingsTables={standingsTables}
                standingsTablesStatus={standingsTablesStatus}
                setStandingsTables={setStandingsTables}
                adminRequest={adminRequest}
                onRetryData={onRetryData}
              />
            )}
          </div>
        )}

        {/* --- SQUAD SECTION --- */}
        {activeTab === 'squad' && (
          <div className="admin-panel admin-panel--stacked">
            <form onSubmit={handleAddPlayer} className={`admin-form${editingPlayerId ? ' admin-form--editing' : ''}`}>
              <h3>{editingPlayerId ? "📝 Edit Roster Member" : "Add Roster Member"}</h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '2 1 200px' }}><label htmlFor="admin-squad-name">Full Name</label><input id="admin-squad-name" required type="text" placeholder="e.g. Marcus Vance" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label htmlFor="admin-squad-position">Position</label><input id="admin-squad-position" required type="text" placeholder="e.g. Striker" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} /></div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="admin-squad-jersey">Jersey #</label><input id="admin-squad-jersey" type="text" placeholder="e.g. 10" value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="admin-squad-age">Age</label><input id="admin-squad-age" type="number" min="0" step="any" placeholder="e.g. 21" value={playerForm.age} onChange={e => setPlayerForm({...playerForm, age: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="admin-squad-apps">Apps</label><input id="admin-squad-apps" type="number" min="0" step="any" value={playerForm.appearances} onChange={e => setPlayerForm({...playerForm, appearances: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label htmlFor="admin-squad-goals">Goals</label><input id="admin-squad-goals" type="number" min="0" step="any" value={playerForm.goals} onChange={e => setPlayerForm({...playerForm, goals: e.target.value})} /></div>
              </div>

              <div className="form-group"><label htmlFor="admin-squad-bio">Short Bio</label><textarea id="admin-squad-bio" rows="2" placeholder="Brief player history..." value={playerForm.bio} onChange={e => setPlayerForm({...playerForm, bio: e.target.value})}></textarea></div>
              <div className="form-group"><label htmlFor="admin-squad-contact">Contact Info (Email/Phone for Staff)</label><input id="admin-squad-contact" type="text" placeholder="e.g. coach@jundaunited.com or +254..." value={playerForm.contact} onChange={e => setPlayerForm({...playerForm, contact: e.target.value})} /></div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label htmlFor="admin-squad-category">Squad Category</label>
                  <select id="admin-squad-category" value={playerForm.squadCategory} onChange={e => setPlayerForm({...playerForm, squadCategory: e.target.value})}>
                    <option value="First Team">First Team</option>
                    <option value="Under 17">Under 17 (U-17)</option>
                    <option value="Under 13">Under 13 (U-13)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label htmlFor="admin-squad-role">Club Role</label>
                  <select id="admin-squad-role" value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}>
                    <option value="player">Player</option>
                    <option value="coach">Coach / Staff</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}><label htmlFor="admin-squad-photo">Profile Photo</label><input id="admin-squad-photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploading} onChange={e => handleFileUpload(e, 'squad')} /></div>
              </div>

              <button
                type="submit"
                className="submit-btn submit-btn--primary"
                disabled={isSubmittingPlayer || isUploading}
              >
                {asyncButtonContent(isSubmittingPlayer, editingPlayerId ? "Saving..." : "Registering...", editingPlayerId ? "💾 Save Changes" : "➕ Register to Roster")}
              </button>
              {editingPlayerId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setEditingPlayerId(null); setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '', age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: '' }); }}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="admin-list">
              <h3 className="admin-list__header" tabIndex={-1}>Current Roster ({players.length})</h3>
              {players.length > 0 && <RecordSearch id="squad-search" label="Search squad members" query={squadQuery} onChange={setSquadQuery} />}
              {players.length > 0 && shownSquad.length === 0 && <p className="admin-list__state" role="status">No squad members match your search.</p>}
              {shownSquad.map(item => (
                <div key={item._id} className="admin-list__row">
                  <div className="admin-list__info">
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>
                      {item.position} • <span className="role-tag">{item.role === 'coach' ? 'Staff' : item.squadCategory}</span>
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditPlayer(item)}><Pencil size={16} aria-hidden="true" /> Edit</button>
                    <button type="button" className="delete-btn" disabled={isDeleting('players', item._id)} onClick={event => confirmDelete(item, 'players', event.currentTarget)}>{asyncButtonContent(isDeleting('players', item._id), "Deleting…", <><Trash2 size={16} aria-hidden="true" /> Delete</>)}</button>
                  </div>
                </div>
                ))}
                {players.length === 0 && renderListState(statusOf('players'), 'squad members', 'No squad members added yet.')}
              </div>
            </div>
          )}

        {/* --- GALLERY SECTION --- */}
        {activeTab === 'gallery' && (
          <div className="admin-panel admin-panel--stacked">
            <form onSubmit={handleAddGallery} className="admin-form">
              <h3>Add gallery media</h3>
              <div className="form-group"><label htmlFor="admin-gallery-file"><Upload size={16} aria-hidden="true" /> Upload an image</label><input id="admin-gallery-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploading || galleryForm.type === 'video'} onChange={e => handleFileUpload(e, 'gallery')} /></div>
              <div className="form-group"><label htmlFor="admin-gallery-caption">Description / Caption</label><input id="admin-gallery-caption" type="text" placeholder="Highlights" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} /></div>
              <div className="form-group"><label htmlFor="admin-gallery-type">Media Type</label><select id="admin-gallery-type" value={galleryForm.type} disabled={isUploading} onChange={e => {
                setGalleryForm(changeGalleryType(galleryForm, e.target.value));
                setMessage(null);
              }}><option value="image">Image</option><option value="video">Video</option></select></div>
              <div className="form-group">
                <label htmlFor="admin-gallery-url">Published media URL</label>
                <input id="admin-gallery-url" type="url" required aria-describedby="gallery-url-hint" value={galleryForm.url}
                  disabled={isUploading} onChange={e => setGalleryForm({ ...galleryForm, url: e.target.value, urlType: galleryForm.type })} />
                <small id="gallery-url-hint">{galleryForm.type === 'video' ? 'Paste a direct link to the hosted video file.' : 'Upload an image to fill this in, or paste a direct link to an image.'}</small>
              </div>
              <AdminGalleryPreview url={galleryForm.url} type={galleryForm.type} isUploading={isUploading}
                uploadedType={getGalleryUploadType(uploadedMediaTypes, galleryForm.url)} />
              <button type="submit" className="submit-btn" disabled={isSubmittingGallery || isUploading}>{asyncButtonContent(isSubmittingGallery, "Saving...", "Add to Gallery")}</button>
            </form>

            <div className="admin-list">
              <h3 className="admin-list__header" tabIndex={-1}>Current Assets ({gallery.length})</h3>
              {gallery.map(item => (
                <div key={item._id} className="admin-list__row">
                  <div className="admin-list__info">
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.caption || "Untitled"}</strong>
                    <p className="subtext type-tag" style={{ marginTop: '0.35rem', display: 'inline-block' }}>{item.type}</p>
                  </div>
                  <button type="button" className="delete-btn" disabled={isDeleting('gallery', item._id)} onClick={event => confirmDelete(item, 'gallery', event.currentTarget)}>{asyncButtonContent(isDeleting('gallery', item._id), "Deleting…", <><Trash2 size={16} aria-hidden="true" /> Delete</>)}</button>
                </div>
              ))}
              {gallery.length === 0 && renderListState(statusOf('gallery'), 'media items', 'No media uploaded yet.')}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
