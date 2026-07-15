import { VoyaLogo } from "./VoyaLogo";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <VoyaLogo height={32} />
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            Plan. Invest. Protect.
          </p>
        </div>
        <div className="text-xs text-muted-foreground space-y-1 md:text-right">
          <p>Beacon · An internal Voya Marketing tool</p>
          <p>For internal use only. Not for public distribution.</p>
        </div>
      </div>
    </footer>
  );
}
