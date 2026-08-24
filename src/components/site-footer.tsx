export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Grooming CRM
      </div>
    </footer>
  );
}
