import { parseMatchDate } from '../../utils/fixtureInput';
import { ArrowUpRight, CalendarDays, ChartNoAxesColumn, Images, Newspaper, UsersRound } from 'lucide-react';

export default function AdminOverview({ collections, fixtures, fixtureStatus, onSelect }) {
  const matchTime = (item, fallback) => parseMatchDate(item.matchDate)?.getTime() ?? fallback;
  const upcoming = fixtures.filter(item => item.status === 'Upcoming')
    .sort((first, second) => matchTime(first, Infinity) - matchTime(second, Infinity)).slice(0, 3);
  const completed = fixtures.filter(item => item.status === 'Completed')
    .sort((first, second) => matchTime(second, -Infinity) - matchTime(first, -Infinity)).slice(0, 3);
  const items = [
    ['news', 'Articles', Newspaper], ['fixtures', 'Matches', CalendarDays],
    ['standings', 'Standings tables', ChartNoAxesColumn], ['squad', 'Squad members', UsersRound], ['gallery', 'Media items', Images]
  ];

  return (
    <div className="club-admin-overview">
      <section aria-labelledby="admin-totals-title">
        <h2 id="admin-totals-title" className="club-admin-overview__label">Club records</h2>
        <div className="club-admin-totals">
          {items.map(([key, label, Icon]) => (
            <button type="button" key={key} onClick={() => onSelect(key)}>
              <span className="club-admin-totals__icon"><Icon size={20} aria-hidden="true" /></span><ArrowUpRight size={17} aria-hidden="true" />
              <strong>{collections[key] ?? '—'}</strong><span>{label}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="club-admin-matches">
        {[[upcoming, 'Upcoming fixtures'], [completed, 'Recent results']].map(([matches, title]) => (
          <section className="admin-form" key={title}>
            <h2>{title}</h2>
            {fixtureStatus === 'error' ? <p>Match data is unavailable.</p> : fixtureStatus !== 'success' ? <p>Loading matches…</p> : matches.length ? (
              <ul>{matches.map(item => <li key={item._id}><strong>{item.isHomeMatch ? 'Junda United vs ' + item.opponent : item.opponent + ' vs Junda United'}</strong>
                <span>{item.matchDate} · {item.status === 'Completed'
                  ? (item.isHomeMatch ? `${item.jundaScore}–${item.opponentScore}` : `${item.opponentScore}–${item.jundaScore}`)
                  : item.kickoffTime}</span></li>)}</ul>
            ) : <p>No match entries yet.</p>}
            <button className="edit-btn" type="button" onClick={() => onSelect('fixtures')}>Manage fixtures</button>
          </section>
        ))}
      </div>
    </div>
  );
}
