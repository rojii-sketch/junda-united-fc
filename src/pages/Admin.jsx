// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import '../Admin.css';

export default function Admin({
  news, setNews,
  players, setPlayers,
  gallery, setGallery,
  fixtures, setFixtures,
  standings, setStandings,
  API_BASE,
  collectionStatuses,
  onRetryData,
  onAuthChange
}) {
  const [activeTab, setActiveTab] = useState('news');

  // Sidebar state management - moved here to be before conditional return
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🎯 JWT Authentication State
  const [adminToken, setAdminToken] = useState(sessionStorage.getItem('junda_jwt') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('junda_jwt'));

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
  const [galleryForm, setGalleryForm] = useState({ type: 'image', url: '', caption: '' });
  const [fixtureForm, setFixtureForm] = useState({
    opponent: '', matchDate: '', kickoffTime: '16:00 EAT', venue: 'Junda Grounds, Mishomoroni',
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

  const getAuthHeaders = (isJson = true) => {
    const headers = { 'Authorization': `Bearer ${adminToken}` };
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isLoggingIn) return;
    if (!usernameInput || !passwordInput) return alert('Both username and password are required!');

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
        setAdminToken(data.token);
        sessionStorage.setItem('junda_jwt', data.token);
        setIsAuthenticated(true);
        onAuthChange?.(true);
        // alert('🔒 Session Authenticated Successfully!'); // (Optional: can remove this alert now that UI feels responsive)
      } else {
        alert(data.message || 'Access Denied. Incorrect username or password.');
        setPasswordInput('');
      }
    } catch (err) {
      console.error(err);
      alert('Server error trying to authenticate.');
    } finally {
      // 🎯 Turn off the loading animation regardless of success or failure
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('junda_jwt');
    setAdminToken(null);
    setIsAuthenticated(false);
    onAuthChange?.(false);
  };

  const handleFileUpload = async (e, formType) => {
    if (isUploading) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(false),
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (formType === 'news') setNewsForm({ ...newsForm, imageUrl: data.url });
        if (formType === 'squad') setPlayerForm({ ...playerForm, image: data.url });
        if (formType === 'gallery') setGalleryForm({ ...galleryForm, url: data.url });
        alert('📸 Asset uploaded smoothly to cloud media storage!');
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file to server.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (isSubmittingNews) return;
    if (!newsForm.title || !newsForm.content) return alert('Title and Content are required!');

    setIsSubmittingNews(true);

    try {
      if (editingNewsId) {
        const updatePayload = { title: newsForm.title, content: newsForm.content, imageUrl: newsForm.imageUrl, date: newsForm.date };
        const response = await fetch(`${API_BASE}/news/${editingNewsId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setNews(news.map(item => item._id === editingNewsId ? updatedItem : item));
          setEditingNewsId(null);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          alert('Article updated smoothly on cloud database!');
        } else {
          alert('Failed to update: Session may have expired. Please log in again.');
        }
      } else {
        const newArticle = { title: newsForm.title, content: newsForm.content, imageUrl: newsForm.imageUrl, date: newsForm.date || new Date().toISOString().split('T')[0] };
        const response = await fetch(`${API_BASE}/news`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newArticle)
        });

        if (response.ok) {
          const savedArticle = await response.json();
          setNews([savedArticle, ...news]);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          alert('Article published cleanly to cloud database!');
        }
      }
    } catch (err) {
      console.error(err);
      alert(editingNewsId ? 'Failed to update article.' : 'Failed to save article.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  const startEditNews = (item) => {
    setEditingNewsId(item._id);
    setNewsForm({ title: item.title, content: item.content, imageUrl: item.imageUrl || '', date: item.date });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (isSubmittingPlayer) return;
    if (!playerForm.name || !playerForm.position) return alert('Name and Position are required!');

    setIsSubmittingPlayer(true);

    try {
      if (editingPlayerId) {
        const response = await fetch(`${API_BASE}/players/${editingPlayerId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(playerForm)
        });
        if (response.ok) {
          const updatedPlayer = await response.json();
          setPlayers(players.map(p => p._id === editingPlayerId ? updatedPlayer : p));
          setEditingPlayerId(null);
          setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '', age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: '' });
          alert('Squad member updated successfully!');
        }
      } else {
        const response = await fetch(`${API_BASE}/players`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(playerForm)
        });
        if (response.ok) {
          const savedPlayer = await response.json();
          setPlayers([...players, savedPlayer]);
          setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '', age: '', squadCategory: 'First Team', appearances: 0, goals: 0, bio: '', contact: '' });
          alert('Squad member registered successfully!');
        }
      }
    } catch (err) {
      console.error(err);
      alert(editingPlayerId ? 'Failed to update roster member.' : 'Failed to add roster member.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (isSubmittingGallery) return;
    if (!galleryForm.url) return alert('Media URL is required!');

    setIsSubmittingGallery(true);
    try {
      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(galleryForm)
      });
      if (response.ok) {
        const savedMedia = await response.json();
        setGallery([...gallery, savedMedia]);
        setGalleryForm({ type: 'image', url: '', caption: '' });
        alert('Media asset uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save gallery asset.');
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handleAddFixture = async (e) => {
    e.preventDefault();
    if (isSubmittingFixture) return;
    if (!fixtureForm.opponent || !fixtureForm.matchDate) return alert('Opponent Name and Match Date are required!');
    const submissionPayload = {
      ...fixtureForm,
      jundaScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.jundaScore) : 0,
      opponentScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.opponentScore) : 0,
    };

    setIsSubmittingFixture(true);
    try {
      const response = await fetch(`${API_BASE}/fixtures`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionPayload)
      });
      if (response.ok) {
        const savedFixture = await response.json();
        setFixtures(current => [savedFixture, ...current]);
        setFixtureForm({ opponent: '', matchDate: '', kickoffTime: '16:00 EAT', venue: 'Junda Grounds, Mishomoroni', status: 'Upcoming', jundaScore: 0, opponentScore: 0, isHomeMatch: true });
        alert('🏅 Match context logged successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record fixture details.');
    } finally {
      setIsSubmittingFixture(false);
    }
  };

  const handleStandingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingStanding) return;
    if (!standingForm.name) return alert('Club Name is required!');
    const parsedForm = standingForm.formInput ? standingForm.formInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "") : [];
    const payload = {
      name: standingForm.name, rank: Number(standingForm.rank) || 1, p: Number(standingForm.p) || 0,
      w: Number(standingForm.w) || 0, d: Number(standingForm.d) || 0, l: Number(standingForm.l) || 0,
      gf: Number(standingForm.gf) || 0, ga: Number(standingForm.ga) || 0, pts: Number(standingForm.pts) || 0, form: parsedForm
    };

    setIsSubmittingStanding(true);
    try {
      const res = await fetch(editingStandingId ? `${API_BASE}/standings/${editingStandingId}` : `${API_BASE}/standings`, {
        method: editingStandingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`❌ DATABASE REJECTED IT:\n\n${errorData.error || errorData.message}`);
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
      alert(editingStandingId ? '✅ Standings row updated successfully!' : '✅ Standings matrix row updated smoothly!');
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id, type) => {
    const key = `${type}:${id}`;
    if (deletingItemKey === key) return;
    setDeletingItemKey(key);

    if (!window.confirm('Are you sure you want to delete this item permanently?')) {
      setDeletingItemKey(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        if (type === 'news') { setNews(news.filter(item => item._id !== id)); if (editingNewsId === id) setEditingNewsId(null); }
        if (type === 'players') { setPlayers(players.filter(item => item._id !== id)); if (editingPlayerId === id) setEditingPlayerId(null); }
        if (type === 'gallery') setGallery(gallery.filter(item => item._id !== id));
        if (type === 'fixtures') setFixtures(fixtures.filter(item => item._id !== id));
        if (type === 'standings') { setStandings(standings.filter(item => item._id !== id)); if (editingStandingId === id) setEditingStandingId(null); }
        alert('Item dropped successfully from database records.');
      } else {
        alert('Failed to delete: Session may have expired. Please log in again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to drop record from backend.');
    } finally {
      setDeletingItemKey(null);
    }
  };

  // 🎯 UPDATE: The login form button now reacts to the `isLoggingIn` state
  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
        <form onSubmit={handleLogin} className="admin-form">
          <h3>Junda UI Secure Gateway</h3>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} disabled={isLoggingIn} />
          </div>
          <div className="form-group">
            <label>Security Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} disabled={isLoggingIn} onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }} />
              <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)} disabled={isLoggingIn}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoggingIn}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isLoggingIn ? 0.7 : 1,
              cursor: isLoggingIn ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoggingIn ? (
              <>
                {/* 🎯 Sleek inline SVG loading spinner */}
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <style>{`
                    .spinner_S1WN{animation:spinner_MgQ0 1.2s linear infinite;transform-origin:center}
                    .spinner_b2T7{animation-delay:-.1s}
                    .spinner_YRVV{animation-delay:-.2s}
                    @keyframes spinner_MgQ0{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
                  `}</style>
                  <g className="spinner_S1WN">
                    <circle cx="12" cy="2.5" r="2.5" opacity=".8"/>
                    <circle cx="16.75" cy="3.77" r="1.5" opacity=".6"/>
                    <circle cx="20.23" cy="7.25" r="1.5" opacity=".4"/>
                    <circle cx="21.50" cy="12.00" r="1.5" opacity=".2"/>
                    <circle cx="20.23" cy="16.75" r="1.5" opacity=".1"/>
                  </g>
                </svg>
                Verifying Credentials...
              </>
            ) : (
              "Unlock Dashboard"
            )}
          </button>
        </form>
      </div>
    );
  }

  // Determine section title and description based on activeTab
  const sectionConfigs = {
    news: { title: 'Manage News', description: 'Create, update and remove club articles in real-time.' },
    fixtures: { title: 'Manage Fixtures', description: 'Log and track match schedules and results.' },
    standings: { title: 'Manage Standings', description: 'Update league table positions and team statistics.' },
    squad: { title: 'Manage Squad', description: 'Handle player registrations, staff records and team roster.' },
    gallery: { title: 'Manage Gallery', description: 'Upload and organize media assets for club communications.' }
  };

  const { title: sectionTitle, description: sectionDescription } = sectionConfigs[activeTab] || { title: 'Admin Dashboard', description: 'Club management dashboard' };

  const handleSelectSection = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const panelStyle = { display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' };
  const listContainerStyle = { width: '100%', boxSizing: 'border-box', maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden', background: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' };
  const listHeaderStyle = { position: 'sticky', top: '-1.25rem', background: '#f1f5f9', paddingTop: '1rem', paddingBottom: '0.75rem', marginTop: 0, marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', zIndex: 10 };
  const listRowStyle = { display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };

  const loadingCollections = Object.entries(collectionStatuses || {})
    .filter(([, status]) => status === 'loading')
    .map(([collection]) => collection);
  const failedCollections = Object.entries(collectionStatuses || {})
    .filter(([, status]) => status === 'error')
    .map(([collection]) => collection);

  return (
    <AdminLayout
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      activeTab={activeTab}
      onSelectSection={handleSelectSection}
      onSidebarToggle={() => setIsSidebarOpen(open => !open)}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="page-container">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Admin Management Dashboard</h2>
            <p>Create, update and remove club assets in real-time.</p>
          </div>
          <button type="button" onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Out
          </button>
        </header>

        <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button type="button" className={activeTab === 'news' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('news')}>Manage News</button>
          <button type="button" className={activeTab === 'fixtures' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('fixtures')}>Manage Fixtures</button>
          <button type="button" className={activeTab === 'standings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('standings')}>Manage Standings</button>
          <button type="button" className={activeTab === 'squad' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('squad')}>Manage Squad</button>
          <button type="button" className={activeTab === 'gallery' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('gallery')}>Manage Gallery</button>
        </div>

        {isUploading && (
          <div style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
            ⏳ Processing file upload to Cloudinary storage stream...
          </div>
        )}

        {(loadingCollections.length > 0 || failedCollections.length > 0) && (
          <div style={{ background: failedCollections.length > 0 ? '#fff5f5' : '#ebf8ff', color: failedCollections.length > 0 ? '#c53030' : '#2b6cb0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
            {loadingCollections.length > 0 && (
              <div>⏳ Loading: {loadingCollections.join(', ')}...</div>
            )}
            {failedCollections.length > 0 && (
              <>
                <div>Unable to load: {failedCollections.join(', ')}.</div>
                {onRetryData && (
                  <button type="button" className="submit-btn" onClick={onRetryData} style={{ marginTop: '0.75rem' }}>
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* --- NEWS SECTION --- */}
        {activeTab === 'news' && (
          <div className="admin-panel" style={panelStyle}>
            <form onSubmit={handleAddNews} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
              <h3>{editingNewsId ? "📝 Edit Article" : "Post New Article"}</h3>
              <div className="form-group"><label>Article Title</label><input type="text" placeholder="e.g. Match Victory!" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} /></div>
              <div className="form-group"><label>Cover Image</label><input type="file" accept="image/*" disabled={isUploading} onChange={e => handleFileUpload(e, 'news')} /></div>
              <div className="form-group"><label>Publish Date (Optional)</label><input type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} /></div>
              <div className="form-group"><label>Article Content</label><textarea placeholder="Write article text here..." rows="4" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea></div>
              <button type="submit" className="submit-btn" disabled={isSubmittingNews}>{editingNewsId ? "Save Changes" : "Publish Post"}</button>
              {editingNewsId && (
                <button type="button" className="cancel-btn" onClick={() => { setEditingNewsId(null); setNewsForm({ title: '', content: '', imageUrl: '', date: '' }); }}>Cancel Edit</button>
              )}
            </form>

            <div style={listContainerStyle}>
              <h3 style={listHeaderStyle}>Current Articles ({news.length})</h3>
              {news.map(item => (
                <div key={item._id} style={listRowStyle}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.date}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditNews(item)}>Edit</button>
                    <button type="button" className="delete-btn" disabled={deletingItemKey === `news:${item._id}`} onClick={() => deleteItem(item._id, 'news')}>Delete</button>
                  </div>
                </div>
                ))}
              {news.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No articles published yet.</div>}
            </div>
          </div>
        )}

        {/* --- FIXTURES SECTION --- */}
        {activeTab === 'fixtures' && (
          <div className="admin-panel" style={panelStyle}>
            <form onSubmit={handleAddFixture} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
              <h3>Log New Match Fixture</h3>
              <div className="form-group"><label>Opponent Team Name</label><input type="text" placeholder="e.g. Black Dragon FC" value={fixtureForm.opponent} onChange={e => setFixtureForm({...fixtureForm, opponent: e.target.value})} /></div>
              <div className="form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 150px' }}><label>Match Date</label><input type="text" placeholder="e.g. 18/07/2026" value={fixtureForm.matchDate} onChange={e => setFixtureForm({...fixtureForm, matchDate: e.target.value})} /></div>
                <div style={{ flex: '1 1 150px' }}><label>Kickoff Time</label><input type="text" value={fixtureForm.kickoffTime} onChange={e => setFixtureForm({...fixtureForm, kickoffTime: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Stadium Venue</label><input type="text" value={fixtureForm.venue} onChange={e => setFixtureForm({...fixtureForm, venue: e.target.value})} /></div>
              <div className="form-group" style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}><input type="checkbox" checked={fixtureForm.isHomeMatch} onChange={e => setFixtureForm({...fixtureForm, isHomeMatch: e.target.checked})} />🏠 Home Match</label></div>
              <div className="form-group"><label>Match Progress Status</label><select value={fixtureForm.status} onChange={e => setFixtureForm({...fixtureForm, status: e.target.value})}><option value="Upcoming">🗓️ Upcoming Match</option><option value="Completed">🏆 Completed</option></select></div>
              {fixtureForm.status === 'Completed' && (
                <div className="form-group" style={{ display: 'flex', gap: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px' }}>
                  <div><label>Junda Score</label><input type="number" min="0" value={fixtureForm.jundaScore} onChange={e => setFixtureForm({...fixtureForm, jundaScore: e.target.value})} style={{ width: '70px' }} /></div>
                  <div style={{ fontWeight: 'bold', alignSelf: 'center', marginTop: '1rem' }}>VS</div>
                  <div><label>Opponent Score</label><input type="number" min="0" value={fixtureForm.opponentScore} onChange={e => setFixtureForm({...fixtureForm, opponentScore: e.target.value})} style={{ width: '70px' }} /></div>
                </div>
              )}
              <button type="submit" className="submit-btn" disabled={isSubmittingFixture}>Save Match Entry</button>
            </form>

            <div style={listContainerStyle}>
              <h3 style={listHeaderStyle}>Active Match Logs ({fixtures?.length || 0})</h3>
              {(fixtures || []).map(item => (
                <div key={item._id} style={listRowStyle}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Junda United vs {item.opponent}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.matchDate} • {item.status === 'Completed' ? `Score: ${item.jundaScore}-${item.opponentScore}` : 'Upcoming'}</p>
                  </div>
                  <button type="button" className="delete-btn" disabled={deletingItemKey === `fixtures:${item._id}`} onClick={() => deleteItem(item._id, 'fixtures')}>Delete</button>
                </div>
              ))}
              {(!fixtures || fixtures.length === 0) && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No fixtures logged yet.</div>}
            </div>
          </div>
        )}

        {/* --- STANDINGS SECTION --- */}
        {activeTab === 'standings' && (
          <div className="admin-panel" style={panelStyle}>
            <form onSubmit={handleStandingSubmit} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
              <h3>{editingStandingId ? "📝 Edit Standings Row" : "📊 Update League Standings Table"}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label>Pos (Rank)</label><input type="number" min="1" value={standingForm.rank} onChange={e => setStandingForm({...standingForm, rank: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '2 1 200px' }}><label>Club Name</label><input type="text" placeholder="e.g. Junda United FC" value={standingForm.name} onChange={e => setStandingForm({...standingForm, name: e.target.value})} required /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.5rem' }}>
                <div className="form-group"><label>P</label><input type="number" value={standingForm.p} onChange={e => setStandingForm({...standingForm, p: e.target.value})} /></div>
                <div className="form-group"><label>W</label><input type="number" value={standingForm.w} onChange={e => setStandingForm({...standingForm, w: e.target.value})} /></div>
                <div className="form-group"><label>D</label><input type="number" value={standingForm.d} onChange={e => setStandingForm({...standingForm, d: e.target.value})} /></div>
                <div className="form-group"><label>L</label><input type="number" value={standingForm.l} onChange={e => setStandingForm({...standingForm, l: e.target.value})} /></div>
                <div className="form-group"><label>GF</label><input type="number" value={standingForm.gf} onChange={e => setStandingForm({...standingForm, gf: e.target.value})} /></div>
                <div className="form-group"><label>GA</label><input type="number" value={standingForm.ga} onChange={e => setStandingForm({...standingForm, ga: e.target.value})} /></div>
                <div className="form-group"><label>Pts</label><input type="number" value={standingForm.pts} onChange={e => setStandingForm({...standingForm, pts: e.target.value})} style={{ fontWeight: 'bold' }} /></div>
              </div>

              <div className="form-group"><label>Form History (Comma separated)</label><input type="text" placeholder="W,W,D,L,W" value={standingForm.formInput} onChange={e => setStandingForm({...standingForm, formInput: e.target.value})} /></div>
              <button
                type="submit"
                className="submit-btn submit-btn--success"
                disabled={isSubmittingStanding}
              >
                {editingStandingId ? "💾 Save Changes" : "💾 Save Team Metrics"}
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

            <div style={listContainerStyle}>
              <h3 style={listHeaderStyle}>Active League Table Rows ({standings?.length || 0})</h3>
              {(standings || []).map(team => (
                <div key={team._id} style={listRowStyle}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Pos {team.rank}. {team.name}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>Points: <span style={{ fontWeight: 'bold', color: '#166534' }}>{team.pts}</span> • Record: P {team.p} W {team.w} D {team.d} L {team.l}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditStanding(team)}>Edit</button>
                    <button type="button" className="delete-btn" disabled={deletingItemKey === `standings:${team._id}`} onClick={() => deleteItem(team._id, 'standings')}>Delete</button>
                  </div>
                </div>
              ))}
              {(!standings || standings.length === 0) && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No teams logged yet.</div>}
            </div>
          </div>
        )}

        {/* --- SQUAD SECTION --- */}
        {activeTab === 'squad' && (
          <div className="admin-panel" style={panelStyle}>
            <form onSubmit={handleAddPlayer} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
              <h3>{editingPlayerId ? "📝 Edit Roster Member" : "Add Roster Member"}</h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '2 1 200px' }}><label>Full Name</label><input type="text" placeholder="e.g. Marcus Vance" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label>Position</label><input type="text" placeholder="e.g. Striker" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} /></div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label>Jersey #</label><input type="text" placeholder="e.g. 10" value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label>Age</label><input type="number" placeholder="e.g. 21" value={playerForm.age} onChange={e => setPlayerForm({...playerForm, age: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label>Apps</label><input type="number" value={playerForm.appearances} onChange={e => setPlayerForm({...playerForm, appearances: e.target.value})} /></div>
                <div className="form-group" style={{ flex: '1 1 100px' }}><label>Goals</label><input type="number" value={playerForm.goals} onChange={e => setPlayerForm({...playerForm, goals: e.target.value})} /></div>
              </div>

              <div className="form-group"><label>Short Bio</label><textarea rows="2" placeholder="Brief player history..." value={playerForm.bio} onChange={e => setPlayerForm({...playerForm, bio: e.target.value})}></textarea></div>
              <div className="form-group"><label>Contact Info (Email/Phone for Staff)</label><input type="text" placeholder="e.g. coach@jundaunited.com or +254..." value={playerForm.contact} onChange={e => setPlayerForm({...playerForm, contact: e.target.value})} /></div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label>Squad Category</label>
                  <select value={playerForm.squadCategory} onChange={e => setPlayerForm({...playerForm, squadCategory: e.target.value})}>
                    <option value="First Team">First Team</option>
                    <option value="Under 17">Under 17 (U-17)</option>
                    <option value="Under 13">Under 13 (U-13)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 150px' }}><label>Club Role</label>
                  <select value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}>
                    <option value="player">Player</option>
                    <option value="coach">Coach / Staff</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}><label>Profile Photo</label><input type="file" accept="image/*" disabled={isUploading} onChange={e => handleFileUpload(e, 'squad')} /></div>
              </div>

              <button
                type="submit"
                className="submit-btn submit-btn--primary"
                disabled={isSubmittingPlayer}
              >
                {editingPlayerId ? "💾 Save Changes" : "➕ Register to Roster"}
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

            <div style={listContainerStyle}>
              <h3 style={listHeaderStyle}>Current Roster ({players.length})</h3>
              {players.map(item => (
                <div key={item._id} style={listRowStyle}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</strong>
                    <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>
                      {item.position} • <span className="role-tag">{item.role === 'coach' ? 'Staff' : item.squadCategory}</span>
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" className="tab-btn tab-btn--compact" onClick={() => startEditPlayer(item)}>Edit</button>
                    <button type="button" className="delete-btn" disabled={deletingItemKey === `players:${item._id}`} onClick={() => deleteItem(item._id, 'players')}>Delete</button>
                  </div>
                </div>
                ))}
                {players.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No squad members added yet.</div>}
              </div>
            </div>
          )}

        {/* --- GALLERY SECTION --- */}
        {activeTab === 'gallery' && (
          <div className="admin-panel" style={panelStyle}>
            <form onSubmit={handleAddGallery} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
              <h3>Upload Media Item</h3>
              <div className="form-group"><label>Select Media File</label><input type="file" accept="image/*" disabled={isUploading} onChange={e => handleFileUpload(e, 'gallery')} /></div>
              <div className="form-group"><label>Description / Caption</label><input type="text" placeholder="Highlights" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} /></div>
              <div className="form-group"><label>Media Type</label><select value={galleryForm.type} onChange={e => setGalleryForm({...galleryForm, type: e.target.value})}><option value="image">Photo Upload</option><option value="video">Video Loop</option></select></div>
              <button type="submit" className="submit-btn" disabled={isSubmittingGallery}>Add to Gallery</button>
            </form>

            <div style={listContainerStyle}>
              <h3 style={listHeaderStyle}>Current Assets ({gallery.length})</h3>
              {gallery.map(item => (
                <div key={item._id} style={listRowStyle}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.caption || "Untitled"}</strong>
                    <p className="subtext type-tag" style={{ marginTop: '0.35rem', display: 'inline-block' }}>{item.type}</p>
                  </div>
                  <button type="button" className="delete-btn" disabled={deletingItemKey === `gallery:${item._id}`} onClick={() => deleteItem(item._id, 'gallery')}>Delete</button>
                </div>
              ))}
              {gallery.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No media uploaded yet.</div>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
