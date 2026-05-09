type Props = { className?: string; tone?: "dark" | "light" | "orange" };

/**
 * Voya wordmark placeholder.
 * In production, swap this for the licensed Voya® logo SVG.
 * Brand rule: maintain clear space; never lock up with origami artwork.
 */
export function VoyaLogo({ className = "", tone = "dark" }: Props) {
  const color =
    tone === "light" ? "var(--voya-warm-white)" : tone === "orange" ? "var(--voya-orange)" : "var(--voya-dark)";
  return (
    <span
      className={`font-display font-semibold tracking-tight ${className}`}
      style={{ color, fontSize: "1.5rem", lineHeight: 1, letterSpacing: "-0.02em" }}
      aria-label="Voya"
    >
      Voya
      <sup
        aria-hidden
        style={{ fontSize: "0.45em", marginLeft: "0.1em", color: "var(--voya-orange)", verticalAlign: "super" }}
      >
        ®
      </sup>
    </span>
  );
}
