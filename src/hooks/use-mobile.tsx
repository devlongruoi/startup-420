import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Determine whether the current viewport is considered mobile.
 *
 * Hooks into `globalThis.matchMedia` (falls back to `globalThis.innerWidth`) and updates the value when the viewport crosses the mobile breakpoint.
 *
 * @returns `true` if the viewport width is less than MOBILE_BREAKPOINT, `false` otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof globalThis === 'undefined' || !('matchMedia' in globalThis)) return;

    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      const g = globalThis as unknown as { innerWidth?: number };
      setIsMobile(
        mql.matches ?? (typeof g.innerWidth === "number" ? g.innerWidth < MOBILE_BREAKPOINT : false),
      );
    };

    onChange();

    if ("addEventListener" in mql) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } else {
      // Fallback: some very old browsers only update matches on resize and
      // do not support addEventListener/addListener. We skip binding here.
      return;
    }
  }, []);

  return isMobile;
}