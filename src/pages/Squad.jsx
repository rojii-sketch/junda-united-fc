import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion, useReducedMotion } from 'framer-motion';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

const placeholderImg = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop';

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function PlayerGrid({ roster, view }) {
  if (view === 'list') {
    return (
      <div className="public-squad__list">
        <div className="public-squad__list-table-wrap">
          <table className="public-squad__list-table">
            <caption className="public-squad__sr-only">Squad player statistics</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Player</th>
                <th scope="col">Position</th>
                <th scope="col">Age</th>
                <th scope="col">Apps</th>
                <th scope="col">Goals</th>
                {roster.some(player => hasValue(player.assists)) && <th scope="col">Assists</th>}
              </tr>
            </thead>
            <tbody>
              {roster.map(player => (
                <tr key={player._id}>
                  <td>{hasValue(player.jerseyNumber) ? player.jerseyNumber : '-'}</td>
                  <th scope="row">
                    <Link to={`/squad/${player._id}`}>{player.name}</Link>
                  </th>
                  <td>{player.position || 'Position not listed'}</td>
                  <td>{hasValue(player.age) ? player.age : '-'}</td>
                  <td>{hasValue(player.appearances) ? player.appearances : '0'}</td>
                  <td>{hasValue(player.goals) ? player.goals : '0'}</td>
                  {roster.some(item => hasValue(item.assists)) && (
                    <td>{hasValue(player.assists) ? player.assists : '-'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="public-squad__list-mobile">
          {roster.map(player => (
            <Link to={`/squad/${player._id}`} className="public-squad__list-mobile-row" key={player._id}>
              <span className="public-squad__list-number">{hasValue(player.jerseyNumber) ? player.jerseyNumber : '-'}</span>
              <span className="public-squad__list-mobile-main">
                <strong>{player.name}</strong>
                <span>{player.position || 'Position not listed'}</span>
              </span>
              <span className="public-squad__list-mobile-stats">
                <span><small>Apps</small>{hasValue(player.appearances) ? player.appearances : '0'}</span>
                <span><small>Goals</small>{hasValue(player.goals) ? player.goals : '0'}</span>
                {roster.some(item => hasValue(item.assists)) && (
                  <span><small>Assists</small>{hasValue(player.assists) ? player.assists : '-'}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="public-squad__player-grid">
      {roster.map(player => (
        <Link to={`/squad/${player._id}`} className="public-squad__player-link" key={player._id}>
          <article className="public-squad__player-card">
            <div className="public-squad__player-media">
              <img
                src={transformCloudinaryUrl(player.image || placeholderImg, 'f_auto,q_auto,w_600,c_limit')}
                srcSet={getCloudinarySrcSet(player.image, [320, 480, 640]) || undefined}
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc((100vw - 3rem) / 2), 360px"
                alt={player.name}
                loading="lazy"
                decoding="async"
              />
              <span className="public-squad__player-number">
                {hasValue(player.jerseyNumber) ? player.jerseyNumber : '—'}
              </span>
            </div>
            <div className="public-squad__player-content">
              <h3>{player.name}</h3>
              <p className="public-squad__player-position">{player.position || 'Position not listed'}</p>
              <div className="public-squad__player-stats">
                <Stat label="Age" value={hasValue(player.age) ? player.age : '-'} />
                <Stat label="Apps" value={hasValue(player.appearances) ? player.appearances : '0'} />
                <Stat label="Goals" value={hasValue(player.goals) ? player.goals : '0'} />
                {hasValue(player.assists) && <Stat label="Assists" value={player.assists} />}
              </div>
              {player.bio && <p className="public-squad__player-bio">{player.bio}</p>}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function StaffGrid({ staff }) {
  return (
    <div className="public-squad__staff-grid">
      {staff.map(member => (
        <article className="public-squad__staff-card public-glass" key={member._id}>
          <div className="public-squad__staff-media">
            <img
              src={transformCloudinaryUrl(member.image || placeholderImg, 'f_auto,q_auto,w_160,c_limit')}
              srcSet={getCloudinarySrcSet(member.image, [80, 120, 160]) || undefined}
              sizes="80px"
              alt={member.name}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="public-squad__staff-content">
            <h3>{member.name}</h3>
            <p>{member.position || 'Staff member'}</p>
            {member.contact && <span>Contact: {member.contact}</span>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Squad() {
  const [players, setPlayers] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [retryCount, setRetryCount] = React.useState(0);
  const [view, setView] = React.useState('grid');
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    const controller = new AbortController();

    fetchJson('/players', controller.signal)
      .then(data => {
        setPlayers(data);
        setStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Error retrieving players:', error);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  if (status === 'loading') {
    return <PageMessage message="Loading the club roster..." />;
  }

  if (status === 'error') {
    return (
      <PageMessage
        message="Unable to load the club roster."
        onRetry={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

  const firstTeam = players.filter(player => player.role === 'player' && (player.squadCategory === 'First Team' || !player.squadCategory));
  const under17 = players.filter(player => player.role === 'player' && player.squadCategory === 'Under 17');
  const under13 = players.filter(player => player.role === 'player' && player.squadCategory === 'Under 13');
  const coachingStaff = players.filter(player => player.role === 'coach');
  const playerGroups = [
    { title: 'First Team', description: 'Senior squad', roster: firstTeam, accent: 'blue' },
    { title: 'Under 17', description: 'Academy squad', roster: under17, accent: 'green' },
    { title: 'Under 13', description: 'Academy squad', roster: under13, accent: 'gold' },
  ];

  return (
    <div className="public-ui public-squad">
      <SEO
        title="Squad"
        description="Meet the Junda United FC first team and youth academy squads."
      />
      <motion.div
        className="public-squad__watermark"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
        aria-hidden="true"
      />

      <main className="public-container public-squad__container">
        <header className="public-squad__header public-glass">
          <span className="public-squad__eyebrow">Junda United FC</span>
          <h1>Club roster</h1>
          <p>Meet the players, academy prospects, and technical staff representing Junda United FC.</p>
        </header>

        <section className="public-squad__players" aria-labelledby="players-heading">
          <div className="public-squad__section-heading-row">
            <div>
              <span className="public-squad__section-label">Players</span>
              <h2 id="players-heading" className="public-section-heading">The squad</h2>
            </div>
            <div className="public-squad__view-toggle" aria-label="Roster view">
              <button type="button" className={view === 'grid' ? 'is-active' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                Grid
              </button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                List
              </button>
            </div>
          </div>

          {playerGroups.map(group => group.roster.length > 0 && (
            <section className="public-squad__category" aria-labelledby={`${group.accent}-squad-heading`} key={group.title}>
              <div
                id={`${group.accent}-squad-heading`}
                className={`public-squad__category-heading public-squad__category-heading--${group.accent}`}
              >
                <div>
                  <span>{group.title}</span>
                  <p>{group.description}</p>
                </div>
                <strong>{group.roster.length} players</strong>
              </div>
              <PlayerGrid roster={group.roster} view={view} />
            </section>
          ))}

          {players.length === 0 && (
            <div className="public-squad__empty" role="status">
              <p>Roster updates are currently being processed. Check back shortly.</p>
            </div>
          )}
        </section>

        {coachingStaff.length > 0 && (
          <section className="public-squad__staff-section" aria-labelledby="staff-heading">
            <div className="public-squad__section-heading-row">
              <div>
                <span className="public-squad__section-label">Administration &amp; technical staff</span>
                <h2 id="staff-heading" className="public-section-heading">The people behind the team</h2>
              </div>
            </div>
            <StaffGrid staff={coachingStaff} />
          </section>
        )}
      </main>
    </div>
  );
}

function PageMessage({ message, onRetry }) {
  return (
    <div className="public-ui public-squad public-squad__state-page">
      <div className="public-container">
        <section className="public-squad__state public-glass" role={onRetry ? 'alert' : 'status'}>
          <span className="public-squad__eyebrow">Junda United FC Squad</span>
          <h1>{message}</h1>
          {onRetry && (
            <button type="button" className="public-squad__retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
