import { taxonomyData } from "@/data/insects";
import { OrderCard } from "@/components/OrderCard";
import { AppHeader } from "@/components/AppHeader";
import { Bug } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-10 space-y-10">
        {/* Hero */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <Bug className="h-3.5 w-3.5" />
            Clase Insecta
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Enciclopedia Entomológica
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Explora la clase más diversa del reino animal. Navega por órdenes, familias y especies
            con datos taxonómicos, ecológicos y de conservación actualizados.
          </p>
        </div>

        {/* Orders Grid */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Órdenes principales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taxonomyData.map((order, i) => (
              <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
