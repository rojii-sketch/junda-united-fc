// src/pages/Admin.jsx
import { useState } from 'react';

export default function Admin({ 
  news, setNews, 
  players, setPlayers, 
  gallery, setGallery, 
  fixtures, setFixtures,
  standings, setStandings,
  API_BASE 
}) {
  const [activeTab, setActiveTab] = useState('news');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '', date: '' });
  const [playerForm, setPlayerForm] = useState({ name: '', position: '', jerseyNumber: '', role: 'player', image: '' });
  const [galleryForm, setGalleryForm] = useState({ type: 'image', url: '', caption: '' });

  const [fixtureForm, setFixtureForm] = useState({
    opponent: '',
    matchDate: '',
    kickoffTime: '16:00 EAT',
    venue: 'Junda Grounds, Mishomoroni',
    status: 'Upcoming',
    jundaScore: 0,
    opponentScore: 0,
    isHomeMatch: true
  });

  const [standingForm, setStandingForm] = useState({
    rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);

  const handleFileUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
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

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!usernameInput || !passwordInput) return alert('Both username and password are required!');
    
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        alert('🔒 Session Authenticated Successfully!');
      } else {
        alert(data.message || 'Access Denied. Incorrect username or password.');
        setPasswordInput('');
      }
    } catch (err) {
      console.error(err);
      alert('Server error trying to authenticate.');
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return alert('Title and Content are required!');
    
    if (editingNewsId) {
      try {
        const updatePayload = {
          title: newsForm.title,
          content: newsForm.content,
          imageUrl: newsForm.imageUrl,
          date: newsForm.date
        };

        const response = await fetch(`${API_BASE}/news/${editingNewsId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setNews(news.map(item => item._id === editingNewsId ? updatedItem : item));
          setEditingNewsId(null);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          alert('Article updated smoothly on cloud database!');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to update article.');
      }
    } else {
      const newArticle = {
        title: newsForm.title,
        content: newsForm.content,
        imageUrl: newsForm.imageUrl,
        date: newsForm.date || new Date().toISOString().split('T')[0]
      };

      try {
        const response = await fetch(`${API_BASE}/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArticle)
        });

        if (response.ok) {
          const savedArticle = await response.json();
          setNews([savedArticle, ...news]);
          setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
          alert('Article published cleanly to cloud database!');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to save article.');
      }
    }
  };

  const startEditNews = (item) => {
    setEditingNewsId(item._id);
    setNewsForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      date: item.date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.name || !playerForm.position) return alert('Name and Position are required!');
    
    try {
      const response = await fetch(`${API_BASE}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm)
      });
      if (response.ok) {
        const savedPlayer = await response.json();
        setPlayers([...players, savedPlayer]);
        setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '' });
        alert('Squad member registered successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add roster member.');
    }
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.url) return alert('Media URL is required!');
    
    try {
      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    }
  };

  const handleAddFixture = async (e) => {
    e.preventDefault();
    if (!fixtureForm.opponent || !fixtureForm.matchDate) return alert('Opponent Name and Match Date are required!');

    const submissionPayload = {
      ...fixtureForm,
      jundaScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.jundaScore) : 0,
      opponentScore: fixtureForm.status === 'Completed' ? Number(fixtureForm.opponentScore) : 0,
    };

    try {
      const response = await fetch(`${API_BASE}/fixtures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      if (response.ok) {
        const savedFixture = await response.json();
        setFixtures([savedFixture, ...fixtures]);
        setFixtureForm({
          opponent: '',
          matchDate: '',
          kickoffTime: '16:00 EAT',
          venue: 'Junda Grounds, Mishomoroni',
          status: 'Upcoming',
          jundaScore: 0,
          opponentScore: 0,
          isHomeMatch: true
        });
        alert('🏅 Match context logged successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record fixture details.');
    }
  };

  const handleStandingSubmit = async (e) => {
    e.preventDefault();
    if (!standingForm.name) return alert('Club Name is required!');
    
    const parsedForm = standingForm.formInput 
      ? standingForm.formInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "")
      : [];
    
    const payload = {
      name: standingForm.name,
      rank: Number(standingForm.rank) || 1,
      p: Number(standingForm.p) || 0,
      w: Number(standingForm.w) || 0,
      d: Number(standingForm.d) || 0,
      l: Number(standingForm.l) || 0,
      gf: Number(standingForm.gf) || 0,
      ga: Number(standingForm.ga) || 0,
      pts: Number(standingForm.pts) || 0,
      form: parsedForm
    };

    try {
      const res = await fetch(`${API_BASE}/standings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`❌ DATABASE REJECTED IT:\n\n${errorData.error}`);
        return; 
      }

      const savedTeam = await res.json();
      const existingIdx = (standings || []).findIndex(t => t.name === savedTeam.name);
      
      if (existingIdx > -1) {
        setStandings(standings.map(t => t.name === savedTeam.name ? savedTeam : t).sort((a,b) => a.rank - b.rank));
      } else {
        setStandings([...(standings || []), savedTeam].sort((a,b) => a.rank - b.rank));
      }
      
      setStandingForm({ rank: 1, name: '', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, formInput: 'W,W,D,L,W' });
      alert('✅ Standings matrix row updated smoothly!');
      
    } catch (err) {
      console.error(err);
      alert('Network error communicating with the server.');
    }
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item permanently?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (type === 'news') {
          setNews(news.filter(item => item._id !== id));
          if (editingNewsId === id) setEditingNewsId(null);
        }
        if (type === 'players') setPlayers(players.filter(item => item._id !== id));
        if (type === 'gallery') setGallery(gallery.filter(item => item._id !== id));
        if (type === 'fixtures') setFixtures(fixtures.filter(item => item._id !== id));
        if (type === 'standings') setStandings(standings.filter(item => item._id !== id)); 
        alert('Item dropped successfully from database records.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to drop record from backend.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
        <form onSubmit={handleLogin} className="admin-form">
          <h3>Junda UI Secure Gateway</h3>
          <div className="form-group">
            <label htmlFor="admin-user">Username</label>
            <input id="admin-user" type="text" placeholder="Username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="admin-pass">Security Password</label>
            <div className="password-input-wrapper">
              <input 
                id="admin-pass" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
              />
              <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="submit-btn">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  // 🎯 RESPONSIVE STYLES (Forces full-width stacking so nothing gets squeezed)
  const panelStyle = { display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' };
  const listContainerStyle = { width: '100%', boxSizing: 'border-box', maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden', background: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' };
  const listHeaderStyle = { position: 'sticky', top: '-1.25rem', background: '#f1f5f9', paddingTop: '1rem', paddingBottom: '0.75rem', marginTop: 0, marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', zIndex: 10 };
  const listRowStyle = { display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Admin Management Dashboard</h2>
        <p>Create, update and remove club assets in real-time.</p>
      </header>

      <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className={activeTab === 'news' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('news')}>Manage News</button>
        <button className={activeTab === 'fixtures' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('fixtures')}>Manage Fixtures</button>
        <button className={activeTab === 'standings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('standings')}>Manage Standings</button>
        <button className={activeTab === 'squad' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('squad')}>Manage Squad</button>
        <button className={activeTab === 'gallery' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('gallery')}>Manage Gallery</button>
      </div>

      {isUploading && (
        <div style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
          ⏳ Processing file upload to Cloudinary storage stream...
        </div>
      )}

      {/* --- NEWS SECTION --- */}
      {activeTab === 'news' && (
        <div className="admin-panel" style={panelStyle}>
          <form onSubmit={handleAddNews} className="admin-form" style={{ width: '100%', boxSizing: 'border-box' }}>
            <h3>{editingNewsId ? "📝 Edit Article" : "Post New Article"}</h3>
            <div className="form-group"><label>Article Title</label><input type="text" placeholder="e.g. Match Victory!" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} /></div>
            <div className="form-group"><label>Cover Image</label><input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'news')} /></div>
            <div className="form-group"><label>Publish Date (Optional)</label><input type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} /></div>
            <div className="form-group"><label>Article Content</label><textarea placeholder="Write article text here..." rows="4" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea></div>
            <button type="submit" className="submit-btn">{editingNewsId ? "Save Changes" : "Publish Post"}</button>
          </form>
          
          <div style={listContainerStyle}>
            <h3 style={listHeaderStyle}>Current Articles ({news.length})</h3>
            {news.map(item => (
              <div key={item._id} style={listRowStyle}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</strong>
                  <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.date}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="tab-btn" style={{ padding: '0.25rem 0.75rem' }} onClick={() => startEditNews(item)}>Edit</button>
                  <button type="button" className="delete-btn" onClick={() => deleteItem(item._id, 'news')}>Delete</button>
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
            <button type="submit" className="submit-btn">Save Match Entry</button>
          </form>

          <div style={listContainerStyle}>
            <h3 style={listHeaderStyle}>Active Match Logs ({fixtures?.length || 0})</h3>
            {(fixtures || []).map(item => (
              <div key={item._id} style={listRowStyle}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Junda United vs {item.opponent}</strong>
                  <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.matchDate} • {item.status === 'Completed' ? `Score: ${item.jundaScore}-${item.opponentScore}` : 'Upcoming'}</p>
                </div>
                <button type="button" className="delete-btn" onClick={() => deleteItem(item._id, 'fixtures')}>Delete</button>
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
            <h3>📊 Update League Standings Table</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="form-group" style={{ flex: '1 1 100px' }}><label>Pos (Rank)</label><input type="number" min="1" value={standingForm.rank} onChange={e => setStandingForm({...standingForm, rank: e.target.value})} /></div>
              <div className="form-group" style={{ flex: '2 1 200px' }}><label>Club Name</label><input type="text" placeholder="e.g. Junda United FC" value={standingForm.name} onChange={e => setStandingForm({...standingForm, name: e.target.value})} required /></div>
            </div>
            
            {/* Switched to responsive flex grids so they stack nicely on small screens */}
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
              className="submit-btn" 
              style={{ 
                background: '#10b981', 
                color: '#fff', 
                width: '100%', 
                padding: '0.85rem', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                marginTop: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#059669';
                e.target.style.boxShadow = '0 6px 14px rgba(16, 185, 129, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
            >
              💾 Save Team Metrics
            </button>
          </form>

          <div style={listContainerStyle}>
            <h3 style={listHeaderStyle}>Active League Table Rows ({standings?.length || 0})</h3>
            {(standings || []).map(team => (
              <div key={team._id} style={listRowStyle}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Pos {team.rank}. {team.name}</strong>
                  <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>Points: <span style={{ fontWeight: 'bold', color: '#166534' }}>{team.pts}</span> • Record: P {team.p} W {team.w} D {team.d} L {team.l}</p>
                </div>
                <button type="button" className="delete-btn" onClick={() => deleteItem(team._id, 'standings')}>Wipe</button>
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
            <h3>Add Roster Member</h3>
            <div className="form-group"><label>Full Name</label><input type="text" placeholder="e.g. Marcus Vance" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} /></div>
            <div className="form-group"><label>Position</label><input type="text" placeholder="e.g. Forward" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} /></div>
            <div className="form-group"><label>Jersey Number</label><input type="text" placeholder="Leave blank if staff" value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})} /></div>
            <div className="form-group"><label>Profile Photo</label><input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'squad')} /></div>
            <div className="form-group"><label>Club Role</label><select value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}><option value="player">First Team Player</option><option value="coach">Coaching Staff</option></select></div>
            <button type="submit" className="submit-btn" disabled={isUploading}>Add to Roster</button>
          </form>

          <div style={listContainerStyle}>
            <h3 style={listHeaderStyle}>Current Roster ({players.length})</h3>
            {players.map(item => (
              <div key={item._id} style={listRowStyle}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</strong>
                  <p className="subtext" style={{ marginTop: '0.35rem', color: '#475569' }}>{item.position} • <span className="role-tag">{item.role}</span></p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item._id, 'players')}>Delete</button>
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
            <div className="form-group"><label>Select Media File</label><input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'gallery')} /></div>
            <div className="form-group"><label>Description / Caption</label><input type="text" placeholder="Highlights" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} /></div>
            <div className="form-group"><label>Media Type</label><select value={galleryForm.type} onChange={e => setGalleryForm({...galleryForm, type: e.target.value})}><option value="image">Photo Upload</option><option value="video">Video Loop</option></select></div>
            <button type="submit" className="submit-btn" disabled={isUploading}>Add to Gallery</button>
          </form>

          <div style={listContainerStyle}>
            <h3 style={listHeaderStyle}>Current Assets ({gallery.length})</h3>
            {gallery.map(item => (
              <div key={item._id} style={listRowStyle}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.caption || "Untitled"}</strong>
                  <p className="subtext type-tag" style={{ marginTop: '0.35rem', display: 'inline-block' }}>{item.type}</p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item._id, 'gallery')}>Delete</button>
              </div>
            ))}
            {gallery.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No media uploaded yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}