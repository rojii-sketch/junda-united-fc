import React from 'react';
import StandingsTable from '../components/StandingsTable';
import { motion, useReducedMotion } from 'framer-motion';
import { fetchJson } from '../api';

export default function FixturesPage() {
  const [fixtures, setFixtures] = React.useState([]);
  const [standingsTables, setStandingsTables] = React.useState([]);
  const [fixturesStatus, setFixturesStatus] = React.useState('loading');
  const [standingsTablesStatus, setStandingsTablesStatus] = React.useState('loading');
  const [fixturesError, setFixturesError] = React.useState(null);
  const [fixturesRetryCount, setFixturesRetryCount] = React.useState(0);
  const [standingsTablesRetryCount, setStandingsTablesRetryCount] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    setFixturesStatus('loading');
    setFixturesError(null);

    fetchJson('/fixtures', controller.signal)
      .then(fixturesData => {
        setFixtures(fixturesData);
        setFixturesStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Error retrieving fixtures:', error);
        setFixturesError(error);
        setFixturesStatus('error');
      });

    return () => controller.abort();
  }, [fixturesRetryCount]);

  React.useEffect(() => {
    const controller = new AbortController();

    setStandingsTablesStatus('loading');

    fetchJson('/standings-tables', controller.signal)
      .then(standingsTablesData => {
        setStandingsTables(standingsTablesData);
        setStandingsTablesStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Error retrieving standings tables:', error);
        setStandingsTablesStatus('error');
      });

    return () => controller.abort();
  }, [standingsTablesRetryCount]);

  const upcomingMatches = fixtures.filter(match => match.status === 'Upcoming' || !match.status);
  const completedMatches = fixtures.filter(match => match.status === 'Completed');
  const nextFixture = getNextFixture(upcomingMatches);
  const remainingUpcomingMatches = nextFixture
    ? upcomingMatches.filter(match => match._id !== nextFixture._id)
    : [];

  const retryFixtures = () => setFixturesRetryCount(count => count + 1);
  const retryStandingsTables = () => setStandingsTablesRetryCount(count => count + 1);

  return (
    <div className="public-ui public-match-centre">
      <ClubWatermark />

      <main className="public-match-centre__container">
        <header className="public-match-centre__header public-glass">
          <span className="public-match-centre__eyebrow">Junda United FC</span>
          <h1 className="public-match-centre__title">Match Centre</h1>
          <p className="public-match-centre__intro">
            Follow fixtures, results, and the latest league standings across the campaign.
          </p>
        </header>

        <section className="public-match-centre__section" aria-labelledby="upcoming-fixtures-heading">
          <SectionHeading id="upcoming-fixtures-heading" accent="blue">
            Upcoming fixtures
          </SectionHeading>
          {fixturesStatus === 'loading' && (
            <SectionStatus message="Loading upcoming fixtures..." />
          )}
          {fixturesStatus === 'error' && (
            <SectionStatus
              message="Unable to load upcoming fixtures."
              onRetry={retryFixtures}
              tone="error"
            />
          )}
          {fixturesStatus === 'success' && upcomingMatches.length === 0 && (
            <EmptyState message="No upcoming matches are scheduled at the moment. Check back soon for updates from management." />
          )}
          {fixturesStatus === 'success' && nextFixture && (
            <div className="public-match-centre__fixture-list">
              <FixtureCard match={nextFixture} featured />
              {remainingUpcomingMatches.map(match => (
                <FixtureCard key={match._id} match={match} />
              ))}
            </div>
          )}
        </section>

        <section className="public-match-centre__section" aria-labelledby="latest-results-heading">
          <SectionHeading id="latest-results-heading" accent="green">
            Latest results
          </SectionHeading>
          {fixturesStatus === 'loading' && (
            <SectionStatus message="Loading recent results..." />
          )}
          {fixturesStatus === 'error' && (
            <SectionStatus
              message="Unable to load recent results."
              onRetry={retryFixtures}
              tone="error"
            />
          )}
          {fixturesStatus === 'success' && completedMatches.length === 0 && (
            <EmptyState message="No match results have been recorded yet." />
          )}
          {fixturesStatus === 'success' && completedMatches.length > 0 && (
            <div className="public-match-centre__fixture-list">
              {completedMatches.map(match => (
                <ResultCard key={match._id} match={match} />
              ))}
            </div>
          )}
        </section>

        <section
          id="standings"
          className="public-match-centre__section public-match-centre__standings-section"
          aria-labelledby="league-standings-heading"
        >
          <SectionHeading id="league-standings-heading" accent="blue">
            League standings
          </SectionHeading>
          {standingsTablesStatus === 'loading' && (
            <SectionStatus message="Loading official league standings from the cloud..." />
          )}
          {standingsTablesStatus === 'error' && (
            <SectionStatus
              message="Unable to load official league standings."
              onRetry={retryStandingsTables}
              tone="error"
            />
          )}
          {standingsTablesStatus === 'success' && standingsTables.length === 0 && (
            <EmptyState message="No standings tables available yet." />
          )}
          {standingsTablesStatus === 'success' && standingsTables.length > 0 && (
            <div className="public-match-centre__standings-list">
              {standingsTables.map(table => (
                <StandingsTable
                  key={table._id}
                  standings={table.teams}
                  category={table.category}
                  league={table.league}
                  headingId={getStandingsHeadingId(table)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getStandingsHeadingId(table) {
  const base = table.slug || table._id || 'table';
  return `standings-table-${base}`;
}

function getNextFixture(matches) {
  if (matches.length === 0) return null;

  const parsedMatches = matches.map(match => ({
    match,
    date: parseMatchDate(match.matchDate),
  }));

  const validMatches = parsedMatches.filter(item => item.date);
  if (validMatches.length === 0) return matches[0];

  return validMatches.reduce((earliest, current) => (
    current.date < earliest.date ? current : earliest
  )).match;
}

function parseMatchDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  const trimmedValue = value.trim();
  const dayMonthYear = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year)
      && date.getMonth() === Number(month) - 1
      && date.getDate() === Number(day)
      ? date
      : null;
  }

  const parsedTime = Date.parse(trimmedValue);
  return Number.isNaN(parsedTime) ? null : new Date(parsedTime);
}

function SectionHeading({ id, accent, children }) {
  return (
    <h2 id={id} className={`public-match-centre__section-heading public-match-centre__section-heading--${accent}`}>
      {children}
    </h2>
  );
}

function FixtureCard({ match, featured = false }) {
  return (
    <article className={`public-match-centre__match-card${featured ? ' public-match-centre__featured-match' : ''}`}>
      <div className="public-match-centre__match-meta">
        {featured && <span className="public-match-centre__featured-label">Next match</span>}
        <span className={`public-match-centre__venue-badge${match.isHomeMatch ? ' public-match-centre__venue-badge--home' : ''}`}>
          {match.isHomeMatch ? 'Home match' : 'Away match'}
        </span>
        <strong>{match.matchDate}</strong>
        <span>Kickoff: {match.kickoffTime}</span>
      </div>
      <div className="public-match-centre__teams" aria-label={`Junda United versus ${match.opponent}`}>
        <strong>Junda United</strong>
        <span className="public-match-centre__vs">VS</span>
        <strong>{match.opponent}</strong>
      </div>
      <div className="public-match-centre__venue">
        <span>Venue</span>
        <strong>{match.venue}</strong>
      </div>
    </article>
  );
}

function ResultCard({ match }) {
  const isWin = match.jundaScore > match.opponentScore;
  const isDraw = match.jundaScore === match.opponentScore;
  const result = isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat';
  const resultClass = isWin ? 'win' : isDraw ? 'draw' : 'loss';

  return (
    <article className={`public-match-centre__match-card public-match-centre__result-card public-match-centre__result-card--${resultClass}`}>
      <div className="public-match-centre__result-meta">
        <strong>{match.matchDate}</strong>
        <span>{match.venue}</span>
      </div>
      <div className="public-match-centre__scoreboard" aria-label={`${result}: Junda United ${match.jundaScore}, ${match.opponent} ${match.opponentScore}`}>
        <strong>Junda United</strong>
        <div className="public-match-centre__score">
          <span>{match.jundaScore}</span>
          <small>-</small>
          <span>{match.opponentScore}</span>
        </div>
        <strong>{match.opponent}</strong>
      </div>
      <span className="public-match-centre__result-label">{result}</span>
    </article>
  );
}

function ClubWatermark() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="public-match-centre__watermark"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 0.1, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
}

function SectionStatus({ message, onRetry, tone = 'neutral' }) {
  return (
    <div className={`public-match-centre__status public-match-centre__status--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="public-match-centre__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="public-match-centre__empty">
      <p>{message}</p>
    </div>
  );
}
