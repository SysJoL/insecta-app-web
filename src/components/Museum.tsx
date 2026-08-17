import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPECIMENS } from "../data/insects";
import {
  SHOP_ITEMS,
  SLOT_COSTS,
  MAX_SLOTS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type ShopItem,
  type DecorationCategory,
} from "../data/museum";
import {
  buyDecoration,
  unlockSlot,
  assignSpecimenToSlot,
  toggleDecoration,
  type PlayerProfile,
} from "../lib/quizEngine";
import { OrderGlyph } from "./glyphs";

interface Props {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
}

type Tab = "museo" | "tienda";

export default function Museum({ profile, onProfileUpdate }: Props) {
  const [tab, setTab] = useState<Tab>("museo");
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [shopCategory, setShopCategory] = useState<DecorationCategory>("vitrina");

  const mastered = SPECIMENS.filter((s) => profile.masteredSpecimens.includes(s.id));
  const visibleSlots = profile.museumSlots.slice(0, profile.slotsUnlocked);
  const canUnlockMore = profile.slotsUnlocked < MAX_SLOTS;
  const nextSlotCost = canUnlockMore ? SLOT_COSTS[profile.slotsUnlocked] : 0;

  const handleBuy = (item: ShopItem) => {
    const updated = buyDecoration(profile, item.id, item.cost);
    if (updated) onProfileUpdate(updated);
  };

  const handleUnlockSlot = () => {
    const updated = unlockSlot(profile, nextSlotCost);
    if (updated) onProfileUpdate(updated);
  };

  const handleAssignSpecimen = (slotIdx: number, specimenId: string | null) => {
    const updated = assignSpecimenToSlot(profile, slotIdx, specimenId);
    onProfileUpdate(updated);
    setEditingSlot(null);
  };

  const handleToggleDeco = (slotIdx: number, decoId: string) => {
    const updated = toggleDecoration(profile, slotIdx, decoId);
    onProfileUpdate(updated);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1.5">
        <button
          onClick={() => setTab("museo")}
          className={`flex items-center gap-2 border px-5 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase transition-all ${
            tab === "museo"
              ? "border-amber bg-amber text-ink shadow-[0_8px_26px_rgba(229,168,59,0.22)]"
              : "border-moss text-sage hover:border-amber/50 hover:text-amber"
          }`}
        >
          🏛️ Mi museo
        </button>
        <button
          onClick={() => setTab("tienda")}
          className={`flex items-center gap-2 border px-5 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase transition-all ${
            tab === "tienda"
              ? "border-amber bg-amber text-ink shadow-[0_8px_26px_rgba(229,168,59,0.22)]"
              : "border-moss text-sage hover:border-amber/50 hover:text-amber"
          }`}
        >
          🛒 Tienda <span className="text-honey">({profile.coins} 🪙)</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "museo" ? (
          <motion.div
            key="museo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Museum grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleSlots.map((slot, i) => {
                const specimen = slot.specimenId
                  ? SPECIMENS.find((s) => s.id === slot.specimenId)
                  : null;

                // Build CSS classes from decorations
                const decoClasses = slot.decorationIds
                  .map((id) => SHOP_ITEMS.find((d) => d.id === id)?.css ?? "")
                  .join(" ");

                return (
                  <div key={i} className="relative">
                    <div
                      className={`group relative overflow-hidden border border-moss/60 bg-pine/80 transition-all hover:border-amber/50 ${decoClasses}`}
                    >
                      {specimen ? (
                        <>
                          {/* Specimen display */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-fern/40">
                            <div className="bg-pingrid flex h-full items-center justify-center">
                              <OrderGlyph k={specimen.orderKey} className="h-20 w-20 text-bone/60" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                            <span className="absolute top-2 left-2 border border-bone/20 bg-ink/70 px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.14em] text-bone uppercase">
                              {specimen.order}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="font-display text-sm font-bold text-parch italic">
                              {specimen.latin}
                            </p>
                            <p className="text-[10px] tracking-[0.14em] text-sage uppercase">
                              {specimen.name}
                            </p>
                          </div>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingSlot(editingSlot === i ? null : i)}
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center border border-bone/30 bg-ink/70 text-bone/70 opacity-0 transition-all hover:border-amber hover:text-amber group-hover:opacity-100"
                          >
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M11.5 1.5l3 3L5 14H2v-3z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        /* Empty slot */
                        <button
                          onClick={() => setEditingSlot(editingSlot === i ? null : i)}
                          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-moss/50 bg-ink/40 transition-colors hover:border-amber/40 hover:bg-amber/5"
                        >
                          <svg viewBox="0 0 24 24" className="h-8 w-8 text-moss" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                          </svg>
                          <span className="text-[10px] font-bold tracking-[0.14em] text-sage/60 uppercase">
                            Slot {i + 1}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Slot editor panel */}
                    <AnimatePresence>
                      {editingSlot === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 border border-moss/60 bg-pine/90 p-3">
                            <p className="mb-2 text-[9px] font-bold tracking-[0.2em] text-sage uppercase">
                              Exhibir espécimen
                            </p>
                            <div className="mb-3 max-h-32 space-y-1 overflow-y-auto">
                              <button
                                onClick={() => handleAssignSpecimen(i, null)}
                                className={`w-full border px-2 py-1.5 text-left text-xs transition-all ${
                                  !slot.specimenId
                                    ? "border-amber bg-amber/10 text-amber"
                                    : "border-moss/50 text-bone/60 hover:border-amber/40"
                                }`}
                              >
                                — Vacío —
                              </button>
                              {mastered.map((sp) => (
                                <button
                                  key={sp.id}
                                  onClick={() => handleAssignSpecimen(i, sp.id)}
                                  className={`w-full border px-2 py-1.5 text-left text-xs transition-all ${
                                    slot.specimenId === sp.id
                                      ? "border-amber bg-amber/10 text-amber"
                                      : "border-moss/50 text-bone/60 hover:border-amber/40"
                                  }`}
                                >
                                  {sp.latin} <span className="text-sage">({sp.name})</span>
                                </button>
                              ))}
                              {mastered.length === 0 && (
                                <p className="text-[10px] text-bone/40 italic">
                                 _domina especímenes en el quiz para exhibirlos aquí_
                                </p>
                              )}
                            </div>

                            {/* Decoration toggles */}
                            {profile.ownedDecorations.length > 0 && (
                              <>
                                <p className="mb-2 text-[9px] font-bold tracking-[0.2em] text-sage uppercase">
                                  Decoraciones
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {profile.ownedDecorations.map((decoId) => {
                                    const deco = SHOP_ITEMS.find((d) => d.id === decoId);
                                    if (!deco) return null;
                                    const isActive = slot.decorationIds.includes(decoId);
                                    return (
                                      <button
                                        key={decoId}
                                        onClick={() => handleToggleDeco(i, decoId)}
                                        className={`border px-2 py-1 text-[9px] font-bold tracking-[0.12em] uppercase transition-all ${
                                          isActive
                                            ? "border-amber bg-amber/15 text-amber"
                                            : "border-moss/50 text-bone/50 hover:border-amber/40"
                                        }`}
                                      >
                                        {deco.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Unlock more slots */}
              {canUnlockMore && (
                <button
                  onClick={handleUnlockSlot}
                  disabled={profile.coins < nextSlotCost}
                  className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 border-2 border-dashed transition-all ${
                    profile.coins >= nextSlotCost
                      ? "border-amber/50 bg-amber/5 text-amber hover:border-amber hover:bg-amber/10"
                      : "border-moss/30 bg-ink/30 text-bone/30"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase">
                    Desbloquear slot
                  </span>
                  <span className="text-[10px] font-bold text-honey">{nextSlotCost} 🪙</span>
                </button>
              )}
            </div>

            {/* Mastery legend */}
            <div className="mt-6 border-t border-moss/50 pt-4">
              <p className="text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                Especímenes dominados ({mastered.length}/{SPECIMENS.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SPECIMENS.map((sp) => {
                  const isMastered = profile.masteredSpecimens.includes(sp.id);
                  const counter = profile.masteryCounters[sp.id] ?? 0;
                  return (
                    <span
                      key={sp.id}
                      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] ${
                        isMastered
                          ? "border-amber/60 bg-amber/10 text-amber"
                          : "border-moss/40 text-bone/30"
                      }`}
                      title={`${sp.latin}: ${counter}/3 correctas seguidas`}
                    >
                      {isMastered && "✓ "}
                      {sp.latin}
                      {!isMastered && (
                        <span className="text-bone/20">{counter}/3</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tienda"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Shop categories */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as DecorationCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShopCategory(cat)}
                  className={`flex items-center gap-1.5 border px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase transition-all ${
                    shopCategory === cat
                      ? "border-amber bg-amber text-ink"
                      : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                  }`}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Shop items */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SHOP_ITEMS.filter((item) => item.category === shopCategory).map((item) => {
                const owned = profile.ownedDecorations.includes(item.id);
                const canBuy = profile.coins >= item.cost && !owned;

                return (
                  <div
                    key={item.id}
                    className={`border p-4 transition-all ${
                      owned
                        ? "border-sage/50 bg-sage/5"
                        : canBuy
                          ? "border-moss bg-pine/80 hover:border-amber/50"
                          : "border-moss/40 bg-ink/40 opacity-60"
                    }`}
                  >
                    {/* Preview swatch */}
                    <div className={`mb-3 h-16 border border-moss/50 ${item.css}`} />
                    <h4 className="font-display text-sm font-bold text-parch">{item.name}</h4>
                    <p className="mt-0.5 text-[10px] text-bone/50">{item.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-honey">
                        {owned ? "✓ Obtenido" : `${item.cost} 🪙`}
                      </span>
                      {!owned && (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canBuy}
                          className={`border px-3 py-1 text-[9px] font-bold tracking-[0.14em] uppercase transition-all ${
                            canBuy
                              ? "border-amber bg-amber text-ink hover:bg-honey"
                              : "border-moss text-bone/30"
                          }`}
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
