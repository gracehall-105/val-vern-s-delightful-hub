type Props = { className?: string; gradient?: boolean };

export function VoyaJourney({ className = "", gradient = true }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <linearGradient id="voya-journey-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--voya-orange)" />
          <stop offset="100%" stopColor="var(--voya-orange-light)" />
        </linearGradient>
      </defs>
      {/* Voya Journey curve — smooth swooping arc, left-to-right */}
      <path
        d="M0,160 C200,40 500,40 700,120 C900,200 1050,140 1200,60 L1200,200 L0,200 Z"
        fill={gradient ? "url(#voya-journey-grad)" : "var(--voya-orange)"}
      />
    </svg>
  );
}
