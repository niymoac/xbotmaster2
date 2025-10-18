"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface NavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  url: string;
}

export function useZoerIframe() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    canGoBack: false,
    canGoForward: false,
    url: '',
  });

  // Navigation durumu kontrolü
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const updateNavigationState = () => {
      const nav: any = (window as any).navigation;
      const canGoBack = nav && typeof nav.canGoBack === "boolean" ? nav.canGoBack : false;
      const canGoForward = nav && typeof nav.canGoForward === "boolean" ? nav.canGoForward : false;
      const url = window.location.href;

      setNavigationState({
        canGoBack,
        canGoForward,
        url,
      });
    };

    updateNavigationState();
  }, [pathname, searchParams]);

  // Parent'tan gelen mesajları dinle
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event?.data;
        if (!data || typeof data !== "object") return;

        const messageType = (data as { type?: string }).type;
        
        switch (messageType) {
          case "back":
            router.back();
            break;
          case "forward":
            router.forward();
            break;
          case "navigate":
            const url = (data as { url?: string }).url;
            if (url) {
              router.push(url);
            }
            break;
          case "refresh":
            window.location.reload();
            break;
          default:
            // Bilinmeyen mesaj türü
            break;
        }
      } catch (error) {
        console.error('Iframe mesaj hatası:', error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // Navigation state'i parent'a bildir
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      (window.parent as any)?.postMessage?.(
        { 
          type: "navigationState", 
          ...navigationState
        },
        "*"
      );
    } catch (error) {
      // Parent erişimi hatası - iframe dışında çalışıyoruz
      console.debug('Parent erişimi yok - normal pencerede çalışıyor');
    }
  }, [navigationState]);

  return navigationState;
}

export default useZoerIframe;