import { Link } from "react-router-dom";
import { TaxonomyOrder } from "@/types/taxonomy";
import { ArrowRight } from "lucide-react";

interface OrderCardProps {
  order: TaxonomyOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={`/order/${order.id}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl" role="img" aria-label={order.commonName}>
          {order.iconEmoji}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>

      <div className="space-y-1">
        <h3 className="font-mono text-sm font-medium text-primary italic">
          {order.name}
        </h3>
        <p className="text-lg font-semibold text-foreground">
          {order.commonName}
        </p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {order.description}
      </p>

      <div className="mt-auto flex items-center gap-2 text-2xs font-mono text-muted-foreground">
        <span className="rounded bg-secondary px-2 py-0.5">
          {order.families.length} familias
        </span>
        <span className="rounded bg-secondary px-2 py-0.5">
          ~{(order.speciesCount / 1000).toFixed(0)}k spp.
        </span>
      </div>
    </Link>
  );
}
