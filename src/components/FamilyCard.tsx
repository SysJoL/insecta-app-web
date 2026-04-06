import { Link } from "react-router-dom";
import { TaxonomyFamily } from "@/types/taxonomy";
import { ArrowRight } from "lucide-react";

interface FamilyCardProps {
  family: TaxonomyFamily;
}

export function FamilyCard({ family }: FamilyCardProps) {
  return (
    <Link
      to={`/order/${family.orderId}/family/${family.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-mono text-sm font-medium text-primary italic">
            {family.name}
          </h3>
          <p className="text-base font-semibold text-foreground">
            {family.commonName}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {family.description}
      </p>

      <div className="mt-auto flex items-center gap-2 text-2xs font-mono text-muted-foreground">
        <span className="rounded bg-secondary px-2 py-0.5">
          {family.species.length} especies
        </span>
        <span className="rounded bg-secondary px-2 py-0.5">
          ~{(family.speciesCount / 1000).toFixed(0)}k spp. total
        </span>
      </div>
    </Link>
  );
}
