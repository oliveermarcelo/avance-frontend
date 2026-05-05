"use client";

import { useShouldHideAppBar } from "./mobile-app-bar-route-aware";
import { cn } from "@/lib/utils";

interface AppMainProps {
  children: React.ReactNode;
}

export function AppMain({ children }: AppMainProps) {
  const hideAppBar = useShouldHideAppBar();
  return (
    <main
      className={cn(
        "flex-1 overflow-x-hidden overflow-y-auto",
        hideAppBar ? "pt-0" : "pt-14 lg:pt-0"
      )}
    >
      {children}
    </main>
  );
}