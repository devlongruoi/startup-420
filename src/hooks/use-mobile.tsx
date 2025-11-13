import * as React from "react";

const MOBILE_BREAKPOINT = 768;

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
