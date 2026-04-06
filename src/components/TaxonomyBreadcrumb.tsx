import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TaxonomyBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function TaxonomyBreadcrumb({ items }: TaxonomyBreadcrumbProps) {
  return (
    <nav aria-label="Taxonomía" className="taxonomy-breadcrumb mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
