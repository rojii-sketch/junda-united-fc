import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion, useReducedMotion } from 'framer-motion';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

const placeholderImg = '/junda-logo.webp';

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

export default function PlayerProfile() {
  const { id } = useParams();
  const [players, setPlayers] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [retryCount, setRetryCount] = React.useState(0);
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
        console.error('Error retrieving player profile:', error);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  const player = players.find(item => item._id === id);

  if (status === 'loading') {
    return <ProfileMessage message="Loading player profile..." />;
  }

  if (status === 'error') {
    return (
      <ProfileMessage
        message="Unable to load this player profile."
        onRetry={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

  if (!player) {
    return (
      <div className="public-ui public-player-profile">
        <main className="public-container public-player-profile__state-page">
          <section className="public-player-profile__state public-glass" aria-labelledby="player-not-found-heading">
            <span className="public-player-profile__eyebrow">Junda United FC Squad</span>
            <h1 id="player-not-found-heading">Player not found</h1>
            <p>The player you are looking for might have been removed by an administrator.</p>
            <Link to="/squad" className="public-player-profile__back-link">Back to Squad</Link>
          </section>
        </main>
      </div>
    );
  }

  const portrait = player.image || player.imageUrl;
  const playerImage = transformCloudinaryUrl(
    portrait || placeholderImg,
    'f_auto,q_auto,w_1200,c_limit'
  );

  return (
    <div className="public-ui public-player-profile">
      <SEO
        title={`${player.name} - Profile`}
        description={`Official player profile for ${player.name}, Junda United FC.`}
        image={playerImage}
      />
      <motion.div
        className="public-player-profile__watermark"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
        aria-hidden="true"
      />

      <main className="public-container public-player-profile__container">
        <Link to="/squad" className="public-player-profile__back-link">
          <ArrowLeft size={18} aria-hidden="true" /> Back to squad
        </Link>

        <article className="public-player-profile__hero">
          <motion.figure
            className={`public-player-profile__image-card public-glass${portrait ? '' : ' public-player-profile__image-card--placeholder'}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={playerImage}
              srcSet={getCloudinarySrcSet(player.image || player.imageUrl, [480, 768, 1200]) || undefined}
              sizes="(max-width: 700px) calc(100vw - 2rem), (max-width: 1100px) 50vw, 550px"
              alt={portrait ? player.name : ''}
              loading="eager"
              decoding="async"
            />
          </motion.figure>

          <motion.div
            className="public-player-profile__details"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <header className="public-player-profile__header">
              <span className="public-player-profile__eyebrow">Junda United FC player</span>
              <div className="public-player-profile__name-row">
                <h1>{player.name}</h1>
                {hasValue(player.jerseyNumber) && <span className="public-player-profile__number">#{player.jerseyNumber}</span>}
              </div>
              <p className="public-player-profile__position">{player.position || 'Position not listed'}</p>
              {player.squadCategory && <p className="public-player-profile__category">{player.squadCategory}</p>}
            </header>

            <dl className="public-player-profile__stats" aria-label="Player statistics">
              <ProfileStat label="Age" value={player.age} />
              <ProfileStat label="Appearances" value={player.appearances} />
              <ProfileStat label="Goals" value={player.goals} />
              <ProfileStat label="Assists" value={player.assists} />
            </dl>

            {player.bio && (
              <section className="public-player-profile__bio" aria-labelledby="player-bio-heading">
                <h2 id="player-bio-heading">About the player</h2>
                <p>{player.bio}</p>
              </section>
            )}
          </motion.div>
        </article>
      </main>
    </div>
  );
}

function ProfileStat({ label, value }) {
  if (!hasValue(value)) return null;

  return (
    <div className="public-player-profile__stat">
      <dt>{label}</dt>
      <dd><strong>{value}</strong></dd>
    </div>
  );
}

function ProfileMessage({ message, onRetry }) {
  return (
    <main className="public-ui public-player-profile public-player-profile__state-page">
      <div className="public-container">
        <section className="public-player-profile__state public-glass" role={onRetry ? 'alert' : 'status'}>
          <span className="public-player-profile__eyebrow">Junda United FC Squad</span>
          <h1>{message}</h1>
          {onRetry && (
            <button type="button" className="public-player-profile__retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
