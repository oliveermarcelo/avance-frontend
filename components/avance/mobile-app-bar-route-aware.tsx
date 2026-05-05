"use client";

import { usePathname } from "next/navigation";
import { MobileAppBar } from "./mobile-app-bar";

const HIDE_PATTERNS = [/^\/aprender\/[^/]+\/aula\/[^/]+/];

export function MobileAppBarRouteAware() {
  const pathname = usePathname();
  const shouldHide = HIDE_PATTERNS.some((re) => re.test(pathname));
  if (shouldHide) return null;
  return <MobileAppBar />;
}

export function useShouldHideAppBar(): boolean {
  const pathname = usePathname();
  return HIDE_PATTERNS.some((re) => re.test(pathname));
}