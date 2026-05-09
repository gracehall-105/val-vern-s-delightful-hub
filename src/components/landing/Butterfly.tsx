type Props = {
  className?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
};

export function Butterfly({ className = "", color = "var(--voya-orange)", size = 36, style }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={`bw-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* body */}
      <ellipse cx="32" cy="32" rx="1.6" ry="11" fill="var(--voya-dark)" />
      {/* wings - origami facets */}
      <path d="M32 32 L8 16 L4 30 L14 38 Z" fill={`url(#bw-${color})`} />
      <path d="M32 32 L10 44 L18 52 L26 44 Z" fill={`url(#bw-${color})`} opacity="0.85" />
      <path d="M32 32 L56 16 L60 30 L50 38 Z" fill={`url(#bw-${color})`} />
      <path d="M32 32 L54 44 L46 52 L38 44 Z" fill={`url(#bw-${color})`} opacity="0.85" />
      {/* antennae */}
      <path d="M32 22 Q30 16 26 14" stroke="var(--voya-dark)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M32 22 Q34 16 38 14" stroke="var(--voya-dark)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
