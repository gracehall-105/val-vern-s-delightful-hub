import beaconLogoSrc from "@/assets/beacon-logo.png";
import beaconWordmarkSrc from "@/assets/beacon-wordmark.png";

type Props = { className?: string; tone?: "dark" | "light" | "orange"; height?: number; variant?: "logo" | "wordmark" };

/**
 * Beacon brand lockup. `variant="logo"` renders the icon+wordmark lockup;
 * `variant="wordmark"` renders the wordmark only.
 */
export function VoyaLogo({ className = "", tone = "dark", height = 32, variant = "logo" }: Props) {
  const src = variant === "wordmark" ? beaconWordmarkSrc : beaconLogoSrc;
  const filter = tone === "light" ? "brightness(0) invert(1)" : undefined;

  return (
    <img
      src={src}
      alt="Beacon"
      height={height}
      style={{ height, width: "auto", filter, display: "block" }}
      className={className}
    />
  );
}
