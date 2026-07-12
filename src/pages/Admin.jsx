// src/pages/Admin.jsx
import { useState } from 'react';

export default function Admin({ news, setNews, players, setPlayers, gallery, setGallery }) {
  const [activeTab, setActiveTab] = useState('news');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Form Input States ---
  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '', date: '' });
  const [playerForm, setPlayerForm] = useState({ name: '', position: '', jerseyNumber: '', role: 'player', image: '' });
  const [galleryForm, setGalleryForm] = useState({ type: 'image', url: '', caption: '' });

  // 👇 TRACKING EDIT STATE
  const [editingNewsId, setEditingNewsId] = useState(null);

  const SECRET_ADMIN_PASSWORD = "junda_united_2026"; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === SECRET_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect passcode. Access Denied.');
      setPasswordInput('');
    }
  };

  // --- News Submit / Save Handler ---
  const handleAddNews = (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return alert('Title and Content are required!');
    
    if (editingNewsId) {
      // 📝 UPDATE EXISTING POST
      setNews(news.map(item => item.id === editingNewsId ? { 
        ...item, 
        title: newsForm.title, 
        content: newsForm.content, 
        imageUrl: newsForm.imageUrl,
        date: newsForm.date || item.date 
      } : item));
      setEditingNewsId(null); // Reset edit tracker
    } else {
      // 🆕 CREATE NEW POST
      const newArticle = {
        id: `news-${Date.now()}`,
        title: newsForm.title,
        content: newsForm.content,
        imageUrl: newsForm.imageUrl,
        date: newsForm.date || new Date().toISOString().split('T')[0]
      };
      setNews([...news, newArticle]);
    }

    // Reset Form
    setNewsForm({ title: '', content: '', imageUrl: '', date: '' });
  };

  // 👇 POPULATE FORM FOR EDITING
  const startEditNews = (item) => {
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      date: item.date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to form smoothly
  };

  // --- Roster & Gallery Handlers ---
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!playerForm.name || !playerForm.position) return alert('Name and Position are required!');
    const newMember = { id: `member-${Date.now()}`, ...playerForm };
    setPlayers([...players, newMember]);
    setPlayerForm({ name: '', position: '', jerseyNumber: '', role: 'player', image: '' });
  };

  const handleAddGallery = (e) => {
    e.preventDefault();
    if (!galleryForm.url) return alert('Media URL is required!');
    const newMedia = { id: `media-${Date.now()}`, ...galleryForm };
    setGallery([...gallery, newMedia]);
    setGalleryForm({ type: 'image', url: '', caption: '' });
  };

  const deleteItem = (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    if (type === 'news') {
      setNews(news.filter(item => item.id !== id));
      if (editingNewsId === id) setEditingNewsId(null);
    }
    if (type === 'player') setPlayers(players.filter(item => item.id !== id));
    if (type === 'gallery') setGallery(gallery.filter(item => item.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
        <form onSubmit={handleLogin} className="admin-form">
          <h3>Junda UI Secure Gateway</h3>
          <div className="form-group">
            <label htmlFor="admin-pass">Enter Security Code</label>
            <div className="password-input-wrapper">
              <input 
                id="admin-pass" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
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

      {/* --- NEWS SECTION --- */}
      {activeTab === 'news' && (
        <div className="admin-panel">
          <form onSubmit={handleAddNews} className="admin-form">
            <h3>{editingNewsId ? "📝 Edit Article" : "Post New Article"}</h3>
            
            <div className="form-group">
              <label htmlFor="news-title">Article Title</label>
              <input id="news-title" type="text" placeholder="e.g. Match Victory!" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
            </div>

            <div className="form-group">
              <label htmlFor="news-image">Cover Image URL</label>
              <input id="news-image" type="text" placeholder="https://example.com/image.jpg" value={newsForm.imageUrl} onChange={e => setNewsForm({...newsForm, imageUrl: e.target.value})} />
            </div>

            <div className="form-group">
              <label htmlFor="news-date">Publish Date (Optional)</label>
              <input id="news-date" type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} />
            </div>

            <div className="form-group">
              <label htmlFor="news-content">Article Content</label>
              <textarea id="news-content" placeholder="Write article text here..." rows="4" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}></textarea>
            </div>

            <button type="submit" className="submit-btn" style={{ backgroundColor: editingNewsId ? '#3182ce' : '' }}>
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
              <div key={item.id} className="admin-item-row" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.title}</strong>
                  <p className="subtext">{item.date}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="tab-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', background: '#edf2f7', color: '#2d3748' }} onClick={() => startEditNews(item)}>Edit</button>
                  <button type="button" className="delete-btn" onClick={() => deleteItem(item.id, 'news')}>Delete</button>
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
            <div className="form-group">
              <label htmlFor="squad-image">Profile Photo URL</label>
              <input id="squad-image" type="text" placeholder="https://example.com/photo.jpg" value={playerForm.image} onChange={e => setPlayerForm({...playerForm, image: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="squad-role">Club Role Classification</label>
              <select id="squad-role" value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}>
                <option value="player">First Team Player</option>
                <option value="coach">Coaching Staff</option>
                <option value="staff">Medical/Support Staff</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">Add to Roster</button>
          </form>

          <div className="item-list">
            <h3>Current Roster ({players.length})</h3>
            {players.map(item => (
              <div key={item.id} className="admin-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <p className="subtext">{item.position} • <span className="role-tag">{item.role}</span></p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item.id, 'player')}>Delete</button>
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
            <div className="form-group">
              <label htmlFor="gallery-url">Media Source URL</label>
              <input id="gallery-url" type="text" placeholder="Image web link or MP4 video URL" value={galleryForm.url} onChange={e => setGalleryForm({...galleryForm, url: e.target.value})} />
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
            <button type="submit" className="submit-btn">Add to Gallery</button>
          </form>

          <div className="item-list">
            <h3>Current Assets ({gallery.length})</h3>
            {gallery.map(item => (
              <div key={item.id} className="admin-item-row">
                <div>
                  <strong>{item.caption || "Untitled Media Asset"}</strong>
                  <p className="subtext type-tag">{item.type}</p>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item.id, 'gallery')}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}