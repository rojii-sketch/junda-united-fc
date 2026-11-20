export default function ClubCrest({ width, alt = '', className = '', loading }) {
  return (
    <img className={`club-crest ${className}`.trim()} src="/junda-logo.webp" alt={alt}
      width={width} height={Math.round(width * 655 / 1200)} loading={loading} />
  );
}
