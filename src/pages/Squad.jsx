// src/pages/Squad.jsx
export default function Squad({ players }) {
  // Separate into categories based on the member's role
  const firstTeam = players.filter(person => person.role === 'player');
  const coachingStaff = players.filter(person => person.role === 'coach');
  const supportStaff = players.filter(person => person.role === 'staff');

  // Reusable component to render a grid section
  const RenderRosterGroup = ({ title, list }) => (
    <section className="squad-section">
      <h3 className="squad-section-title">{title}</h3>
      {list.length === 0 ? (
        <p className="no-members-msg">No staff registered in this category.</p>
      ) : (
        <div className="squad-grid">
          {list.map((member) => (
            <div key={member.id} className="squad-card">
              <div className="squad-card-image">
                <img src={member.image || "https://via.placeholder.com/400x500?text=No+Photo"} alt={member.name} />
                {member.jerseyNumber && (
                  <span className="jersey-number">{member.jerseyNumber}</span>
                )}
              </div>
              <div className="squad-card-info">
                <h4>{member.name}</h4>
                <p>{member.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Club Roster</h2>
        <p>Meet the players, technical bench, and support staff powering the club.</p>
      </header>

      {/* Render each group separately */}
      <RenderRosterGroup title="First Team Players" list={firstTeam} />
      <RenderRosterGroup title="Coaching Staff" list={coachingStaff} />
      <RenderRosterGroup title="Medical & Support Staff" list={supportStaff} />
    </div>
  );
}