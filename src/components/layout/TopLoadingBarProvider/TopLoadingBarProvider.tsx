"use client";

import { createContext, useContext, useRef, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingBar from "react-top-loading-bar";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";

interface TopLoadingBarContextType {
  start: () => void;
  complete: () => void;
  continuousStart: () => void;
  staticStart: () => void;
}

const TopLoadingBarContext = createContext<
  TopLoadingBarContextType | undefined
>(undefined);

export const useTopLoadingBar = () => {
  const context = useContext(TopLoadingBarContext);
  if (!context) {
    throw new Error(
      "useTopLoadingBar must be used within a TopLoadingBarProvider"
    );
  }
  return context;
};

interface TopLoadingBarProviderProps {
  children: ReactNode;
}

export const TopLoadingBarProvider = ({
  children,
}: TopLoadingBarProviderProps) => {
  const ref = useRef<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { searchParams, SearchParamsLoader } = useClientSearchParams();

  const start = () => {
    ref.current?.continuousStart();
  };

  const complete = () => {
    ref.current?.complete();
  };

  const continuousStart = () => {
    ref.current?.continuousStart();
  };

  const staticStart = () => {
    ref.current?.staticStart();
  };

  useEffect(() => {
    // Intercept router.push, router.replace, and router.back
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = (...args) => {
      start();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      start();
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      start();
      return originalBack.apply(router);
    };

    router.forward = () => {
      start();
      return originalForward.apply(router);
    };

    // Cleanup
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [router, start]);

  useEffect(() => {
    // Complete loading when pathname changes
    const timer = setTimeout(() => {
      complete();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, complete]);

  useEffect(() => {
    // Complete loading when search params change
    const timer = setTimeout(() => {
      complete();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams, complete]);

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      start();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [start]);

  return (
    <TopLoadingBarContext.Provider
      value={{ start, complete, continuousStart, staticStart }}
    >
      <LoadingBar
        ref={ref}
        color="var(--color-primary)" // Blue color to match your theme
        height={3}
        shadow={true}
        transitionTime={200}
        loaderSpeed={500}
        waitingTime={400}
      />
      <SearchParamsLoader />
      {children}
    </TopLoadingBarContext.Provider>
  );
};
