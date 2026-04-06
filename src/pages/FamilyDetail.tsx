import { useParams, Navigate } from "react-router-dom";
import { getFamily, getOrder } from "@/data/insects";
import { SpeciesCard } from "@/components/SpeciesCard";
import { TaxonomyBreadcrumb } from "@/components/TaxonomyBreadcrumb";
import { AppHeader } from "@/components/AppHeader";

const FamilyDetail = () => {
  const { orderId, familyId } = useParams<{ orderId: string; familyId: string }>();
  const order = orderId ? getOrder(orderId) : undefined;
  const family = orderId && familyId ? getFamily(orderId, familyId) : undefined;

  if (!order || !family) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-10 space-y-6">
        <TaxonomyBreadcrumb
          items={[
            { label: "Insecta", href: "/" },
            { label: order.name, href: `/order/${order.id}` },
            { label: family.name },
          ]}
        />

        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground">{family.commonName}</h1>
          <p className="font-mono text-sm text-primary italic">Familia {family.name}</p>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">{family.description}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Especies ({family.species.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {family.species.map((sp, i) => (
              <div key={sp.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <SpeciesCard species={sp} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FamilyDetail;
