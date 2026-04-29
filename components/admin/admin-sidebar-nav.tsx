"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/lib/admin-navigation";

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {adminNavSections.map((section, sIdx) => (
        <div key={sIdx} className="flex flex-col gap-1">
          {section.label && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.label}
            </p>
          )}

          {section.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href + "/")) ||
              (item.href === "/admin" && pathname === "/admin");

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}