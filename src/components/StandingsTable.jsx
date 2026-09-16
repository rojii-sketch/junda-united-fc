export default function StandingsTable({
  standings = [],
  isLoading = false,
  error = null,
  onRetry,
  category = 'Official standings - Group D campaign',
  league = 'FKF Mombasa County League',
  headingId,
}) {
  if (isLoading) {
    return (
      <div className="public-match-centre__status" role="status">
        <p>Loading official league standings from the cloud...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-match-centre__status public-match-centre__status--error" role="alert">
        <p>Unable to load official league standings.</p>
        {onRetry && (
          <button type="button" className="public-match-centre__retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="public-match-centre__empty">
        <p>No league standings are available yet.</p>
      </div>
    );
  }

  return (
    <div className="public-match-centre__table-shell" aria-labelledby={headingId}>
      <div className="public-match-centre__table-header">
        <div>
          <h3 id={headingId}>{league}</h3>
          <p>{category}</p>
        </div>
        <span className="public-match-centre__table-status">Current table</span>
      </div>
      <div className="public-match-centre__table-scroll" tabIndex="0" aria-label="Scrollable league standings table">
        <table className="public-match-centre__table">
          <caption className="public-match-centre__sr-only">
            League standings showing position, club, matches played, wins, draws, losses, goal difference, points, and recent form.
          </caption>
          <thead>
            <tr>
              <th scope="col">Pos</th>
              <th scope="col">Club</th>
              <th scope="col">P</th>
              <th scope="col">W</th>
              <th scope="col">D</th>
              <th scope="col">L</th>
              <th scope="col">GD</th>
              <th scope="col">Pts</th>
              <th scope="col">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(team => {
              const teamName = team.name || 'Unknown Team';
              const isJunda = teamName.toLowerCase().includes('junda united');
              const goalDifference = (team.gf || 0) - (team.ga || 0);

              return (
                <tr className={isJunda ? 'public-match-centre__table-row--junda' : ''} key={team._id || team.rank}>
                  <td className={team.rank <= 2 ? 'public-match-centre__position--top' : ''}>{team.rank}</td>
                  <th scope="row">
                    <span className="public-match-centre__club-name">
                      {isJunda && <span aria-hidden="true">🛡️</span>}
                      {teamName}
                    </span>
                  </th>
                  <td>{team.p}</td>
                  <td className="public-match-centre__stat--win">{team.w}</td>
                  <td className="public-match-centre__stat--draw">{team.d}</td>
                  <td className="public-match-centre__stat--loss">{team.l}</td>
                  <td className={goalDifference > 0 ? 'public-match-centre__stat--win' : goalDifference < 0 ? 'public-match-centre__stat--loss' : 'public-match-centre__stat--draw'}>
                    {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                  </td>
                  <td className="public-match-centre__points">{team.pts}</td>
                  <td>
                    <div className="public-match-centre__form" aria-label={`Recent form: ${(team.form || []).join(', ') || 'not available'}`}>
                      {(team.form || []).map((form, index) => (
                        <span
                          className={`public-match-centre__form-badge public-match-centre__form-badge--${form.toLowerCase()}`}
                          key={`${team._id || team.rank}-${form}-${index}`}
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
