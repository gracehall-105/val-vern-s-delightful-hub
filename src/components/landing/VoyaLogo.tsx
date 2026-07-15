import voyaLogoSrc from "@/assets/voya-logo.png.asset.json";

type Props = { className?: string; height?: number };

/**
 * Voya corporate wordmark. Used as a parent-company mark on the Beacon site.
 */
export function VoyaLogo({ className = "", height = 28 }: Props) {
  return (
    <img
      src={voyaLogoSrc.url}
      alt="Voya"
      height={height}
      style={{ height, width: "auto", display: "block" }}
      className={className}
    />
  );
}
