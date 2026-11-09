// Visuel d'une destination : sa photo si le serveur en fournit une,
// sinon un fond à sa couleur avec un motif d'étoiles à huit branches.
export default function Cover({ destination, className = '' }) {
  if (destination.image) {
    return <img className={`cover ${className}`} src={destination.image} alt="" loading="lazy" />;
  }
  const patternId = `zellige-${destination.id}`;
  return (
    <div className={`cover ${className}`} style={{ background: `linear-gradient(135deg, ${destination.color}, color-mix(in srgb, ${destination.color} 55%, #1a1a1a))` }}>
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5">
              <rect x="14" y="14" width="28" height="28" />
              <rect x="14" y="14" width="28" height="28" transform="rotate(45 28 28)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
