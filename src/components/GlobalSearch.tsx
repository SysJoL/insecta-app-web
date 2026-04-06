import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { taxonomyData } from "@/data/insects";
import { Species } from "@/types/taxonomy";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FlatSpecies extends Species {
  orderName: string;
  familyName: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const allSpecies = useMemo<FlatSpecies[]>(() => {
    const result: FlatSpecies[] = [];
    for (const order of taxonomyData) {
      for (const family of order.families) {
        for (const species of family.species) {
          result.push({
            ...species,
            orderName: order.name,
            familyName: family.name,
          });
        }
      }
    }
    return result;
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (speciesId: string) => {
    setOpen(false);
    navigate(`/species/${speciesId}`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground font-normal h-8 w-56 justify-start"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Buscar especie…</span>
        <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Nombre común o científico…" />
        <CommandList>
          <CommandEmpty>No se encontraron especies.</CommandEmpty>
          <CommandGroup heading="Especies">
            {allSpecies.map((sp) => (
              <CommandItem
                key={sp.id}
                value={`${sp.commonName} ${sp.scientificName}`}
                onSelect={() => handleSelect(sp.id)}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-medium text-foreground">
                    {sp.commonName}
                  </span>
                  <span className="truncate text-xs italic text-muted-foreground">
                    {sp.scientificName}
                  </span>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {sp.orderName}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
