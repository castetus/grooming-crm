import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-semibold"></Link>
        <nav aria-label="Основная навигация" className="flex items-center gap-4 text-sm">
          {/* <Link href="/">Главная</Link>
          <Link href="/crm">CRM</Link> */}
        </nav>
      </div>
    </header>
  );
}
