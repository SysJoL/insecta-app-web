import { useParams, Navigate } from "react-router-dom";
import { getOrder } from "@/data/insects";
import { FamilyCard } from "@/components/FamilyCard";
import { TaxonomyBreadcrumb } from "@/components/TaxonomyBreadcrumb";
import { AppHeader } from "@/components/AppHeader";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? getOrder(orderId) : undefined;

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-10 space-y-6">
        <TaxonomyBreadcrumb
          items={[
            { label: "Insecta", href: "/" },
            { label: `${order.name}` },
          ]}
        />

        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{order.iconEmoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{order.commonName}</h1>
              <p className="font-mono text-sm text-primary italic">Orden {order.name}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">{order.description}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Familias ({order.families.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.families.map((family, i) => (
              <div key={family.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <FamilyCard family={family} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrderDetail;
