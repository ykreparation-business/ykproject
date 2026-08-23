"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/content/site";
import { villes } from "@/content/villes";
import { cn } from "@/lib/utils";
import { devisSchema, type DevisInput } from "@/lib/validations/devis";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = ["typeDeBien", "besoin", "contexte", "coordonnees"] as const;
type Step = (typeof STEPS)[number];

const FIELDS_BY_STEP: Record<Step, Path<DevisInput>[]> = {
  typeDeBien: ["typeDeBien"],
  besoin: ["besoin"],
  contexte: ["surface", "nombrePoints", "emplacement", "internetSurPlace", "delai"],
  coordonnees: ["nom", "telephone", "email", "commune", "message"],
};

const TYPE_DE_BIEN_OPTIONS = [
  { value: "maison", label: "Maison" },
  { value: "appartement", label: "Appartement" },
  { value: "commerce", label: "Commerce" },
  { value: "entreprise", label: "Entreprise" },
  { value: "copropriete", label: "Copropriété" },
] as const;

const BESOIN_OPTIONS = [
  { value: "cameras", label: "Caméras" },
  { value: "alarme", label: "Alarme" },
  { value: "les-deux", label: "Caméras + alarme" },
  { value: "controle-acces", label: "Contrôle d'accès" },
  { value: "depannage", label: "Dépannage sur installation existante" },
] as const;

const EMPLACEMENT_OPTIONS = [
  { value: "interieur", label: "Intérieur" },
  { value: "exterieur", label: "Extérieur" },
  { value: "les-deux", label: "Les deux" },
] as const;

const INTERNET_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
] as const;

const DELAI_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "1-mois", label: "Sous 1 mois" },
  { value: "3-mois", label: "Sous 3 mois" },
  { value: "pas-presse", label: "Pas pressé" },
] as const;

function RadioCards<T extends string>({
  name,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  error?: string;
  columns?: 2 | 3;
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={name}
        className={cn("grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border px-5 py-4 text-left text-sm font-medium transition-colors",
              value === option.value
                ? "border-teal bg-teal/10 text-teal"
                : "border-slate/60 text-blanc/80 hover:border-teal/60",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-vermillon mt-2 text-sm">{error}</p> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-vermillon mt-1.5 text-sm">{message}</p>;
}

const inputClass =
  "w-full rounded-lg border border-slate/60 bg-nuit-deep px-4 py-3 text-sm text-blanc placeholder:text-blanc/40 focus:border-teal focus:outline-none";

export function DevisForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const currentStep = STEPS[step]!;

  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<DevisInput>({
    resolver: zodResolver(devisSchema),
    mode: "onTouched",
  });

  const values = watch();

  async function goNext() {
    const valid = await trigger(FIELDS_BY_STEP[currentStep]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: DevisInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Reveal className="border-slate/60 rounded-2xl border p-10 text-center">
        <div className="border-teal text-teal mx-auto flex size-14 items-center justify-center rounded-full border text-2xl">
          ✓
        </div>
        <h2 className="font-display mt-6 text-2xl font-semibold">Demande envoyée</h2>
        <p className="text-blanc/70 mx-auto mt-3 max-w-md">
          Merci ! Un email de confirmation vient de t&apos;être envoyé. Un conseiller{" "}
          {site.nom} te recontacte rapidement.
        </p>
        <a
          href={site.telephoneHref}
          className="hover:bg-teal-deep bg-teal text-blanc mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium transition-colors"
        >
          Ou appelle directement {site.telephone}
        </a>
      </Reveal>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <div className="bg-slate/40 h-1 overflow-hidden rounded-full">
          <motion.div
            className="bg-teal h-full origin-left rounded-full"
            initial={false}
            animate={{ scaleX: (step + 1) / STEPS.length }}
            style={{ width: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          />
        </div>
        <p className="text-blanc/50 mt-3 font-mono text-xs tracking-widest uppercase">
          Étape {step + 1} / {STEPS.length}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          if (step < STEPS.length - 1) {
            e.preventDefault();
            void goNext();
          } else {
            void handleSubmit(onSubmit)(e);
          }
        }}
      >
        {/* Honeypot anti-spam — champ visuellement masqué, jamais rempli par un humain */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="siteWeb">Ne pas remplir</label>
          <input
            id="siteWeb"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("siteWeb")}
          />
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {currentStep === "typeDeBien" ? (
            <fieldset>
              <legend className="font-display text-xl font-semibold">
                Quel type de bien ?
              </legend>
              <div className="mt-6">
                <RadioCards
                  name="typeDeBien"
                  options={TYPE_DE_BIEN_OPTIONS}
                  value={values.typeDeBien}
                  onChange={(v) => {
                    setValue("typeDeBien", v);
                    void trigger("typeDeBien");
                  }}
                  error={errors.typeDeBien?.message}
                  columns={3}
                />
              </div>
            </fieldset>
          ) : null}

          {currentStep === "besoin" ? (
            <fieldset>
              <legend className="font-display text-xl font-semibold">
                De quoi as-tu besoin ?
              </legend>
              <div className="mt-6">
                <RadioCards
                  name="besoin"
                  options={BESOIN_OPTIONS}
                  value={values.besoin}
                  onChange={(v) => {
                    setValue("besoin", v);
                    void trigger("besoin");
                  }}
                  error={errors.besoin?.message}
                />
              </div>
            </fieldset>
          ) : null}

          {currentStep === "contexte" ? (
            <fieldset className="space-y-6">
              <legend className="font-display text-xl font-semibold">
                Le contexte du site
              </legend>

              <div>
                <label htmlFor="surface" className="text-blanc/70 text-sm">
                  Surface approximative (m²)
                </label>
                <input
                  id="surface"
                  className={cn(inputClass, "mt-2")}
                  placeholder="Ex. 90"
                  {...register("surface")}
                />
                <FieldError message={errors.surface?.message} />
              </div>

              <div>
                <label htmlFor="nombrePoints" className="text-blanc/70 text-sm">
                  Nombre de points à couvrir
                </label>
                <input
                  id="nombrePoints"
                  type="number"
                  min={1}
                  className={cn(inputClass, "mt-2")}
                  placeholder="Ex. 4"
                  {...register("nombrePoints")}
                />
                <FieldError message={errors.nombrePoints?.message} />
              </div>

              <RadioCards
                name="emplacement"
                options={EMPLACEMENT_OPTIONS}
                value={values.emplacement}
                onChange={(v) => {
                  setValue("emplacement", v);
                  void trigger("emplacement");
                }}
                error={errors.emplacement?.message}
              />

              <div>
                <p className="text-blanc/70 text-sm">Internet sur place ?</p>
                <div className="mt-2">
                  <RadioCards
                    name="internetSurPlace"
                    options={INTERNET_OPTIONS}
                    value={values.internetSurPlace}
                    onChange={(v) => {
                      setValue("internetSurPlace", v);
                      void trigger("internetSurPlace");
                    }}
                    error={errors.internetSurPlace?.message}
                  />
                </div>
              </div>

              <div>
                <p className="text-blanc/70 text-sm">Délai souhaité</p>
                <div className="mt-2">
                  <RadioCards
                    name="delai"
                    options={DELAI_OPTIONS}
                    value={values.delai}
                    onChange={(v) => {
                      setValue("delai", v);
                      void trigger("delai");
                    }}
                    error={errors.delai?.message}
                  />
                </div>
              </div>
            </fieldset>
          ) : null}

          {currentStep === "coordonnees" ? (
            <fieldset className="space-y-6">
              <legend className="font-display text-xl font-semibold">
                Tes coordonnées
              </legend>

              <div>
                <label htmlFor="nom" className="text-blanc/70 text-sm">
                  Nom complet
                </label>
                <input id="nom" className={cn(inputClass, "mt-2")} {...register("nom")} />
                <FieldError message={errors.nom?.message} />
              </div>

              <div>
                <label htmlFor="telephone" className="text-blanc/70 text-sm">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  className={cn(inputClass, "mt-2")}
                  placeholder="0690 12 34 56"
                  {...register("telephone")}
                />
                <FieldError message={errors.telephone?.message} />
              </div>

              <div>
                <label htmlFor="email" className="text-blanc/70 text-sm">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={cn(inputClass, "mt-2")}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div>
                <label htmlFor="commune" className="text-blanc/70 text-sm">
                  Commune
                </label>
                <select
                  id="commune"
                  className={cn(inputClass, "mt-2")}
                  {...register("commune")}
                >
                  <option value="">Sélectionne ta commune</option>
                  {villes.map((v) => (
                    <option key={v.slug} value={v.nom}>
                      {v.nom}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.commune?.message} />
              </div>

              <div>
                <label htmlFor="message" className="text-blanc/70 text-sm">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className={cn(inputClass, "mt-2")}
                  {...register("message")}
                />
                <FieldError message={errors.message?.message} />
              </div>
            </fieldset>
          ) : null}
        </motion.div>

        {status === "error" ? (
          <p className="border-vermillon/40 bg-vermillon/10 text-vermillon mt-6 rounded-lg border px-4 py-3 text-sm">
            L&apos;envoi a échoué. Réessaie, ou appelle-nous directement au{" "}
            {site.telephone}.
          </p>
        ) : null}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="text-blanc/60 hover:text-blanc text-sm font-medium disabled:opacity-0"
          >
            ← Retour
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="submit"
              className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-6 py-3 text-sm font-medium transition-colors"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="hover:bg-teal-deep bg-teal text-blanc rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {status === "submitting" ? "Envoi..." : "Envoyer ma demande"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
