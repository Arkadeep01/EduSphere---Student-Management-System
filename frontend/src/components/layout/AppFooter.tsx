import { APP_NAME, COPYRIGHT_YEAR, getFullVersionString } from "@/lib/version";

export function AppFooter() {
  return (
    <footer className="border-t bg-muted/30 py-4 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-muted-foreground">
        <span>&copy; {COPYRIGHT_YEAR} {APP_NAME}. All rights reserved.</span>
        <span>{getFullVersionString()}</span>
      </div>
    </footer>
  );
}
