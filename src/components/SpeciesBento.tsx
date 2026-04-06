import { Species, conservationColors, conservationLabels, developmentColors } from "@/types/taxonomy";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Ruler, Clock, Utensils, Dna, ListTree } from "lucide-react";

interface SpeciesBentoProps {
  species: Species;
  orderName?: string;
  familyName?: string;
}

function InfoCell({ icon: Icon, label, children }: { icon: typeof Leaf; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function SpeciesBento({ species, orderName, familyName }: SpeciesBentoProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{species.commonName}</h1>
        <p className="font-mono text-lg text-primary italic">
          {species.scientificName}{" "}
          <span className="text-sm text-muted-foreground not-italic">
            {species.author}, {species.year}
          </span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge className={`${developmentColors[species.developmentType]} text-primary-foreground`}>
            {species.developmentType}
          </Badge>
          <Badge className={`${conservationColors[species.conservationStatus]} text-primary-foreground`}>
            {species.conservationStatus} — {conservationLabels[species.conservationStatus]}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
        {species.description}
      </p>

      {/* Bento Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCell icon={ListTree} label="Taxonomía">
          <ul className="space-y-1 text-xs">
            <li><span className="text-muted-foreground">Clase:</span> Insecta</li>
            {orderName && <li><span className="text-muted-foreground">Orden:</span> {orderName}</li>}
            {familyName && <li><span className="text-muted-foreground">Familia:</span> {familyName}</li>}
            <li><span className="text-muted-foreground">Especie:</span> <em>{species.scientificName}</em></li>
          </ul>
        </InfoCell>

        <InfoCell icon={Ruler} label="Tamaño">
          {species.size.min}–{species.size.max} {species.size.unit}
        </InfoCell>

        <InfoCell icon={Leaf} label="Hábitat">
          <div className="flex flex-wrap gap-1">
            {species.habitat.map((h) => (
              <Badge key={h} variant="outline" className="text-2xs">{h}</Badge>
            ))}
          </div>
        </InfoCell>

        <InfoCell icon={MapPin} label="Distribución">
          {species.distribution}
        </InfoCell>

        <InfoCell icon={Clock} label="Ciclo de vida">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Duración: {species.lifecycle.duration}</p>
            <div className="flex flex-wrap gap-1">
              {species.lifecycle.stages.map((s) => (
                <Badge key={s} variant="secondary" className="text-2xs">{s}</Badge>
              ))}
            </div>
          </div>
        </InfoCell>

        <InfoCell icon={Utensils} label="Alimentación">
          {species.diet}
        </InfoCell>

        <InfoCell icon={Dna} label="Características">
          <ul className="space-y-1">
            {species.characteristics.map((c) => (
              <li key={c} className="text-xs flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </InfoCell>
      </div>
    </div>
  );
}
