import { useParams, Navigate } from "react-router-dom";
import { getOrder, getFamily, getSpecies } from "@/data/insects";
import { SpeciesBento } from "@/components/SpeciesBento";
import { TaxonomyBreadcrumb } from "@/components/TaxonomyBreadcrumb";
import { AppHeader } from "@/components/AppHeader";

const SpeciesDetail = () => {
  const { orderId, familyId, speciesId } = useParams<{
    orderId: string;
    familyId: string;
    speciesId: string;
  }>();

  const order = orderId ? getOrder(orderId) : undefined;
  const family = orderId && familyId ? getFamily(orderId, familyId) : undefined;
  const species = orderId && familyId && speciesId ? getSpecies(orderId, familyId, speciesId) : undefined;

  if (!order || !family || !species) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-10 space-y-6">
        <TaxonomyBreadcrumb
          items={[
            { label: "Insecta", href: "/" },
            { label: order.name, href: `/order/${order.id}` },
            { label: family.name, href: `/order/${order.id}/family/${family.id}` },
            { label: species.scientificName },
          ]}
        />

        <SpeciesBento species={species} />
      </main>
    </div>
  );
};

export default SpeciesDetail;
