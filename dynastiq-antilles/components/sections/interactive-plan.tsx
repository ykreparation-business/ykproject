"use client";

import { useState } from "react";
import {
  plans,
  VIEWBOX,
  type PointEquipement,
  type TypeEquipement,
} from "@/content/plan-interactif";
import { cn } from "@/lib/utils";

const COLORS: Record<TypeEquipement, string> = {
  camera: "var(--teal)",
  detecteur: "var(--amber)",
  sirene: "var(--vermillon)",
  hub: "var(--blanc)",
  acces: "var(--amber)",
};

const TYPE_LABELS: Record<TypeEquipement, string> = {
  camera: "Caméra",
  detecteur: "Détecteur",
  sirene: "Sirène",
  hub: "Hub",
  acces: "Contrôle d'accès",
};

function degToVector(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { dx: Math.sin(rad), dy: -Math.cos(rad) };
}

function conePath(point: PointEquipement, length = 100, spread = 50) {
  if (point.angle === undefined) return "";
  const left = degToVector(point.angle - spread / 2);
  const right = degToVector(point.angle + spread / 2);
  const p1 = { x: point.x + left.dx * length, y: point.y + left.dy * length };
  const p2 = { x: point.x + right.dx * length, y: point.y + right.dy * length };
  return `M ${point.x} ${point.y} L ${p1.x} ${p1.y} A ${length} ${length} 0 0 1 ${p2.x} ${p2.y} Z`;
}

export function InteractivePlan() {
  const [planId, setPlanId] = useState<(typeof plans)[number]["id"]>("maison");
  const plan = plans.find((p) => p.id === planId) ?? plans[0]!;
  const [activeId, setActiveId] = useState<string>(plan.points[0]!.id);

  const active = plan.points.find((p) => p.id === activeId) ?? plan.points[0]!;

  function selectPlan(id: (typeof plans)[number]["id"]) {
    const next = plans.find((p) => p.id === id)!;
    setPlanId(id);
    setActiveId(next.points[0]!.id);
  }

  return (
    <div>
      <div role="tablist" aria-label="Type de bien" className="mb-8 flex flex-wrap gap-2">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === planId}
            onClick={() => selectPlan(p.id)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              p.id === planId
                ? "border-teal bg-teal/10 text-teal"
                : "border-slate/60 text-blanc/70 hover:border-teal/60",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="border-slate/60 bg-nuit-deep relative overflow-hidden rounded-2xl border p-4">
          <svg
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            className="h-auto w-full"
            aria-hidden
          >
            {plan.contour?.map((seg, i) => (
              <line
                key={`contour-${i}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="var(--slate)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
            {plan.murs.map((seg, i) => (
              <line
                key={`mur-${i}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="var(--slate)"
                strokeWidth={2}
              />
            ))}

            {active.type === "camera" && active.angle !== undefined ? (
              <path d={conePath(active)} fill="var(--teal)" opacity={0.18} />
            ) : null}

            {plan.points.map((point) => (
              <circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r={point.id === activeId ? 7 : 5}
                fill={COLORS[point.type]}
                opacity={point.id === activeId ? 1 : 0.7}
              />
            ))}
          </svg>

          {plan.points.map((point) => (
            <button
              key={point.id}
              type="button"
              onClick={() => setActiveId(point.id)}
              onFocus={() => setActiveId(point.id)}
              onMouseEnter={() => setActiveId(point.id)}
              aria-label={point.label}
              aria-pressed={point.id === activeId}
              className={cn(
                "focus-visible:ring-teal focus-visible:ring-offset-nuit-deep absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2",
              )}
              style={{
                left: `${(point.x / VIEWBOX.width) * 100}%`,
                top: `${(point.y / VIEWBOX.height) * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="border-slate/60 rounded-2xl border p-6">
          <p
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: COLORS[active.type] }}
          >
            {TYPE_LABELS[active.type]}
          </p>
          <h3 className="font-display mt-2 text-lg font-semibold">{active.label}</h3>
          <p className="text-blanc/50 mt-4 font-mono text-xs tracking-widest uppercase">
            Matériel recommandé
          </p>
          <ul className="text-blanc/80 mt-2 space-y-1 text-sm">
            {active.materiel.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <p className="text-blanc/50 mt-5 font-mono text-xs tracking-widest uppercase">
            Pourquoi
          </p>
          <p className="text-blanc/75 mt-2 text-sm leading-relaxed">{active.pourquoi}</p>
        </div>
      </div>
    </div>
  );
}
