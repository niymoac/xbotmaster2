import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // İlk durumu ayarla
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Event listener ekle
    mql.addEventListener("change", onChange);
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export default useIsMobile;