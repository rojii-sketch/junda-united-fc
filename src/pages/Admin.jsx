// src/pages/Admin.jsx
import { useState } from 'react';

export default function Admin({ news, setNews, players, setPlayers, gallery, setGallery, API_BASE }) {
  const [activeTab, setActiveTab] = useState('news');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Form Input States ---
  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '', date: '' });
  const [playerForm, setPlayerForm] = useState({ name: '', position: '', jerseyNumber: '', role: 'player', image: '' });
  const [galleryForm, setGalleryForm] = useState({ type: 'image', url: '', caption: '' });

  // Uploading state loaders
  const [isUploading, setIsUploading] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);

  // 🔄 UNIVERSAL IMAGE UPLOAD MACHINE HOOK
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
        // Direct target sync depending on active workflow form
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

  // 🔐 BACKEND AUTHENTICATION HANDLER
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

  // --- News Submit / Save Handler ---
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

  // --- Roster Handlers ---
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

  // --- Gallery Handlers ---
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

  // --- MERN DELETE Handler ---
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
            <input 
              id="admin-user" 
              type="text" 
              placeholder="Username" 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)} 
            />
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

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Admin Management Dashboard</h2>
        <p>Create, update and remove club assets in real-time.</p>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'news' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('news')}>Manage News</button>
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
        <div className="admin-panel">
          <form onSubmit={handleAddNews} className="admin-form">
            <h3>{editingNewsId ? "📝 Edit Article" : "Post New Article"}</h3>
            
            <div className="form-group">
              <label htmlFor="news-title">Article Title</label>
              <input id="news-title" type="text" placeholder="e.g. Match Victory!" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
            </div>

            {/* 📸 FILE UPLOAD INSTEAD OF STRIP STRING */}
            <div className="form-group">
              <label htmlFor="news-file">Cover Image Upload</label>
              <input id="news-file" type="file" accept="image/*" onChange={e => handleFileUpload(e, 'news')} />
              {newsForm.imageUrl && <p className="subtext" style={{ color: '#2f855a' }}>✓ Live image loaded: {newsForm.imageUrl.substring(0, 45)}...</p>}
            </div>

            <div className="form-group">
              <label htmlFor="news-date">Publish Date (Optional)</label>
              <input id="news-date" type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} />
            </div>

            <div className="form-group">
              <label htmlFor="news-content">Article Content</label>
              <textarea id="news-content" placeholder="Write article text here..." rows="4" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={isUploading} style={{ backgroundColor: editingNewsId ? '#3182ce' : '' }}>
              {editingNewsId ? "Save Changes" : "Publish Post"}
            </button>
            {editingNewsId && (
              <button type="button" className="submit-btn" style={{ backgroundColor: '#718096', marginTop: '0.5rem' }} onClick={() => { setEditingNewsId(null); setNewsForm({ title: '', content: '', imageUrl: '', date: '' }); }}>
                Cancel Edit
              </button>
            )}
          </form>

          <div className="item-list">
            <h3>Current Articles ({news.length})</h3>
            {news.map(item => (
              <div key={item._id} className="admin-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.title}</strong>
                  <p className="subtext">{item.date}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="tab-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', background: '#edf2f7', color: '#2d3748' }} onClick={() => startEditNews(item)}>Edit</button>
                  <button type="button" className="delete-btn" onClick={() => deleteItem(item._id, 'news')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SQUAD SECTION --- */}
      {activeTab === 'squad' && (
        <div className="admin-panel">
          <form onSubmit={handleAddPlayer} className="admin-form">
            <h3>Add Roster Member</h3>
            <div className="form-group">
              <label htmlFor="squad-name">Full Name</label>
              <input id="squad-name" type="text" placeholder="e.g. Marcus Vance" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="squad-position">Position / Job Title</label>
              <input id="squad-position" type="text" placeholder="e.g. Forward, Head Coach" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="squad-jersey">Jersey Number</label>
              <input id="squad-jersey" type="text" placeholder="Leave blank if staff" value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})} />
            </div>

            {/* 📸 FILE UPLOAD FOR SQUAD */}
            <div className="form-group">
              <label htmlFor="squad-file">Profile Photo Upload</label>
              <input id="squad-file" type="file" accept="image/*" onChange={e => handleFileUpload(e, 'squad')} />
              {playerForm.image && <p className="subtext" style={{ color: '#2f855a' }}>✓ Profile photo attached.</p>}
            </div>

            <div className="form-group">
              <label htmlFor="squad-role">Club Role Classification</label>
              <select id="squad-role" value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}>
                <option value="player">First Team Player</option>
                <option value="coach">Coaching Staff</option>
                <option value="staff">Medical/Support Staff</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={isUploading}>Add to Roster</button>
          </form>

          <div className="item-list">
            <h3>Current Roster ({players.length})</h3>
            {players.map(item => (
              <div key={item._id} className="admin-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="subtext">{item.position} • <span className="role-tag">{item.role}</span></p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item._id, 'players')}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GALLERY SECTION --- */}
      {activeTab === 'gallery' && (
        <div className="admin-panel">
          <form onSubmit={handleAddGallery} className="admin-form">
            <h3>Upload Media Item</h3>
            
            {/* 📸 FILE UPLOAD FOR GALLERY */}
            <div className="form-group">
              <label htmlFor="gallery-file">Select Media File</label>
              <input id="gallery-file" type="file" accept="image/*" onChange={e => handleFileUpload(e, 'gallery')} />
              {galleryForm.url && <p className="subtext" style={{ color: '#2f855a' }}>✓ Media asset locked in.</p>}
            </div>

            <div className="form-group">
              <label htmlFor="gallery-caption">Description / Caption</label>
              <input id="gallery-caption" type="text" placeholder="e.g. Match day highlights" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="gallery-type">Media Type</label>
              <select id="gallery-type" value={galleryForm.type} onChange={e => setGalleryForm({...galleryForm, type: e.target.value})}>
                <option value="image">Photo Upload</option>
                <option value="video">Video Loop (MP4)</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={isUploading}>Add to Gallery</button>
          </form>

          <div className="item-list">
            <h3>Current Assets ({gallery.length})</h3>
            {gallery.map(item => (
              <div key={item._id} className="admin-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.caption || "Untitled Media Asset"}</strong>
                  <p className="subtext type-tag">{item.type}</p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item._id, 'gallery')}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}