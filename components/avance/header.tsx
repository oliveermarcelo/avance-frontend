interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b border-border bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col min-w-0">
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="text-lg font-bold text-primary leading-tight truncate">
            {title}
          </h1>
        )}
      </div>
    </header>
  );
}