import voyaLogoSrc from "@/assets/voya-logo.png";

type Props = { className?: string; tone?: "dark" | "light" | "orange"; height?: number };

/**
 * Official Voya® wordmark.
 * Brand rules: maintain clear space (≥ 0.5× cap-height of the "a"); never lock up with origami artwork;
 * minimum digital width 111px.
 */
export function VoyaLogo({ className = "", tone = "dark", height = 32 }: Props) {
  // tone filter: dark is native; light inverts to white; orange tints via hue-rotate fallback (rare)
  const filter =
    tone === "light"
      ? "brightness(0) invert(1)"
      : tone === "orange"
      ? "brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(4500%) hue-rotate(2deg) brightness(101%) contrast(105%)"
      : undefined;

  return (
    <img
      src={voyaLogoSrc}
      alt="Voya"
      height={height}
      style={{ height, width: "auto", filter, display: "block" }}
      className={className}
      // Minimum brand width is 111px; at height 32 the natural width comfortably exceeds this.
    />
  );
}
