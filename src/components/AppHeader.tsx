import { Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalSearch } from "@/components/GlobalSearch";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Bug className="h-5 w-5 text-primary" />
          <span>InsectApp</span>
        </Link>
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Explorar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
