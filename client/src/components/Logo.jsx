// Logo : une porte en arc outrepassé avec une étoile à huit branches.
export default function Logo({ size = 36 }) {
  return (
    <svg className="logo" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="var(--accent)" />
      <path d="M16 40V28.550A11 11 0 1 1 32 28.550V40Z" fill="#fffaf0" />
      <g fill="var(--saffron)">
        <rect x="20" y="17" width="8" height="8" />
        <rect x="20" y="17" width="8" height="8" transform="rotate(45 24 21)" />
      </g>
    </svg>
  );
}
