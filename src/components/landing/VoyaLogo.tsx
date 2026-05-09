type Props = { className?: string; tone?: "dark" | "light" | "orange" };

export function VoyaLogo({ className = "", tone = "dark" }: Props) {
  const color =
    tone === "light" ? "var(--voya-warm-white)" : tone === "orange" ? "var(--voya-orange)" : "var(--voya-dark)";
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span
        className="font-display font-semibold tracking-tight"
        style={{ color, fontSize: "1.5em", lineHeight: 1 }}
      >
        Voya
      </span>
      <span style={{ color: "var(--voya-orange)", fontSize: "1.5em", lineHeight: 1 }}>.</span>
    </span>
  );
}
