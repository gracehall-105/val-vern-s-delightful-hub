import { VoyaJourney } from "./VoyaJourney";

/**
 * Voya Journey divider — used between content sections.
 * Brand rule: Voya Journey curves move left-to-right with the darker
 * orange on the left. Never overlay the origami animals on top of it.
 */
export function JourneyDivider() {
  return (
    <div aria-hidden className="relative -mt-px">
      <VoyaJourney className="block w-full h-[100px] md:h-[140px]" />
    </div>
  );
}
