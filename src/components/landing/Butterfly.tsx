type Props = {
  className?: string;
  color?: string; // kept for API compatibility; butterflies now use the Voya orange/purple palette
  size?: number;
  style?: React.CSSProperties;
};

export function Butterfly({ className = "", size = 36, style }: Props) {
  const flapDelay = style?.animationDelay ?? "0s";

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
        <linearGradient id="butterfly-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--voya-orange)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--voya-orange-light)" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="butterfly-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--voya-purple)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--voya-orange)" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* left wing group */}
      <g
        className="animate-flap-left"
        style={{ animationDelay: flapDelay, transformOrigin: "32px 32px" }}
      >
        <path d="M32 32 L8 16 L4 30 L14 38 Z" fill="url(#butterfly-orange)" />
        <path d="M32 32 L10 44 L18 52 L26 44 Z" fill="url(#butterfly-purple)" opacity="0.9" />
      </g>

      {/* right wing group */}
      <g
        className="animate-flap-right"
        style={{ animationDelay: flapDelay, transformOrigin: "32px 32px" }}
      >
        <path d="M32 32 L56 16 L60 30 L50 38 Z" fill="url(#butterfly-orange)" />
        <path d="M32 32 L54 44 L46 52 L38 44 Z" fill="url(#butterfly-purple)" opacity="0.9" />
      </g>

      {/* body */}
      <ellipse cx="32" cy="32" rx="1.8" ry="11" fill="var(--voya-dark)" />

      {/* antennae */}
      <path d="M32 22 Q30 16 26 14" stroke="var(--voya-dark)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M32 22 Q34 16 38 14" stroke="var(--voya-dark)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
