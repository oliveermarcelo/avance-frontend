import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-8">
      <div className="flex flex-col">
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="text-lg font-bold text-primary leading-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </Button>
      </div>
    </header>
  );
}