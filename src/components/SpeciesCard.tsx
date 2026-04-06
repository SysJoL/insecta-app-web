import { Link } from "react-router-dom";
import { Species, conservationColors, developmentColors } from "@/types/taxonomy";
import { Badge } from "@/components/ui/badge";

interface SpeciesCardProps {
  species: Species;
}

export function SpeciesCard({ species }: SpeciesCardProps) {
  return (
    <Link
      to={`/order/${species.orderId}/family/${species.familyId}/species/${species.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="space-y-1">
        <p className="font-mono text-sm font-medium text-primary italic">
          {species.scientificName}
        </p>
        <p className="text-base font-semibold text-foreground">
          {species.commonName}
        </p>
        <p className="text-2xs text-muted-foreground font-mono">
          {species.author}, {species.year}
        </p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {species.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <Badge
          variant="secondary"
          className={`${developmentColors[species.developmentType]} text-primary-foreground text-2xs`}
        >
          {species.developmentType}
        </Badge>
        <Badge
          variant="secondary"
          className={`${conservationColors[species.conservationStatus]} text-primary-foreground text-2xs`}
        >
          {species.conservationStatus}
        </Badge>
        <Badge variant="outline" className="text-2xs">
          {species.size.min}–{species.size.max} {species.size.unit}
        </Badge>
      </div>
    </Link>
  );
}
