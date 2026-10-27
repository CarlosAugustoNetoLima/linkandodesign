"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { briefingCopy, type ServiceId } from "@/lib/briefing";
import type { Locale } from "@/lib/i18n";

const field =
  "w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-ink/35 transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

type Values = {
  name: string;
  email: string;
  phone: string;
  company: string;
  details: string;
  reference: string;
  deadline: string;
  budget: string;
  website: string; // honeypot
};

const empty: Values = {
  name: "",
  email: "",
  phone: "",
  company: "",
  details: "",
  reference: "",
  deadline: "",
  budget: "",
  website: "",
};

const STEPS = 3;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

export default function BriefingForm({ locale }: { locale: Locale }) {
  const t = briefingCopy[locale];
  const reduced = useReducedMotion();
  const top = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 avança, -1 volta (direção da animação)
  const [services, setServices] = useState<ServiceId[]>([]);
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    setV((cur) => ({ ...cur, [k]: e.target.value }));
    if (errors[k]) setErrors((cur) => ({ ...cur, [k]: "" }));
  };
  const toggle = (id: ServiceId) => {
    setServices((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));
    if (errors.services) setErrors((cur) => ({ ...cur, services: "" }));
  };

  // a cada troca de etapa, volta o foco ao topo do formulário (leitor de tela
  // e teclado acompanham) — menos na primeira renderização
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    top.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    top.current?.focus({ preventScroll: true });
  }, [step, reduced]);

  // erros da etapa atual; só valida o que a etapa mostra
  function validate(s: number) {
    const next: Record<string, string> = {};
    if (s === 0 && !services.length) next.services = t.errors.services;
    if (s === 1) {
      if (!v.name.trim()) next.name = t.errors.required;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) next.email = t.errors.email;
    }
    if (s === 2 && !v.details.trim()) next.details = t.errors.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  async function send() {
    setStatus("sending");
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          services,
          ...Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val.trim()])),
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  // Enter dentro de um campo também avança; só a última etapa envia
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending" || !validate(step)) return;
    if (step < STEPS - 1) go(step + 1);
    else send();
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl bg-charcoal p-8 text-white shadow-dark sm:p-12">
        <p className="font-display text-xl text-lime" aria-hidden="true">
          ✦
        </p>
        <h2 className="mt-4 font-display text-h1 font-extrabold uppercase">{t.success.title}</h2>
        <p className="mt-5 max-w-xl leading-relaxed text-white/70">{t.success.text}</p>
        <Link href="/" className="btn-brut btn-brut--dark mt-10">
          {t.success.home}
        </Link>
      </div>
    );
  }

  const sending = status === "sending";
  const titles = [t.services.title, t.about.title, t.project.title];
  const last = step === STEPS - 1;

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 36 * dir },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -36 * dir },
      };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* progresso: segmentos clicáveis só para etapas já alcançadas */}
      <div ref={top} tabIndex={-1} className="scroll-mt-24 outline-none">
        <div className="flex items-center gap-3">
          <ol className="flex flex-1 gap-2" aria-label="Progresso">
            {Array.from({ length: STEPS }, (_, i) => (
              <li key={i} className="flex-1">
                <button
                  type="button"
                  disabled={i >= step}
                  onClick={() => go(i)}
                  aria-label={`${t.steps.step} ${i + 1}: ${titles[i]}`}
                  aria-current={i === step ? "step" : undefined}
                  className="group block w-full py-2 disabled:cursor-default"
                >
                  <span className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <span
                      className={`block h-full rounded-full bg-ink transition-all duration-500 ${
                        i <= step ? "w-full" : "w-0"
                      } ${i < step ? "group-hover:bg-ink/60" : ""}`}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
            {t.steps.step} {step + 1} {t.steps.of} {STEPS}
          </p>
        </div>
      </div>

      <div className="mt-10 min-h-[22rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            {...slide}
            transition={{ duration: reduced ? 0.01 : 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h2 className="flex items-baseline gap-4">
              <span className="num-hollow font-display text-3xl font-extrabold">
                {String(step + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-h2 font-extrabold uppercase">{titles[step]}</span>
            </h2>

            {step === 0 && (
              <div>
                <p className="mt-2 text-sm text-muted">{t.services.hint}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {t.services.items.map((s) => {
                    const on = services.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-pressed={on}
                        className={`group relative flex flex-col items-start justify-start rounded-2xl border p-5 text-left transition-all duration-200 ${
                          on
                            ? "border-charcoal bg-charcoal text-white shadow-dark"
                            : "border-line bg-surface shadow-card hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-card-lg"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-all ${
                            on ? "border-lime bg-lime text-charcoal" : "border-ink/25 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="block pr-7 font-display text-lg font-extrabold">
                          {s.label}
                        </span>
                        <span className={`mt-1.5 block text-sm ${on ? "text-white/65" : "text-muted"}`}>
                          {s.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.services && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    {errors.services}
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label={t.about.name} error={errors.name}>
                  <input
                    name="name"
                    value={v.name}
                    onChange={set("name")}
                    autoComplete="name"
                    maxLength={120}
                    className={field}
                  />
                </Field>
                <Field label={t.about.email} error={errors.email}>
                  <input
                    name="email"
                    type="email"
                    value={v.email}
                    onChange={set("email")}
                    autoComplete="email"
                    maxLength={160}
                    className={field}
                  />
                </Field>
                <Field label={t.about.phone} hint={t.about.phoneHint}>
                  <input
                    name="phone"
                    type="tel"
                    value={v.phone}
                    onChange={set("phone")}
                    autoComplete="tel"
                    maxLength={40}
                    className={field}
                  />
                </Field>
                <Field label={t.about.company} hint={t.about.optional}>
                  <input
                    name="company"
                    value={v.company}
                    onChange={set("company")}
                    autoComplete="organization"
                    maxLength={160}
                    className={field}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6 space-y-5">
                <Field label={t.project.details} error={errors.details}>
                  <textarea
                    name="details"
                    value={v.details}
                    onChange={set("details")}
                    rows={6}
                    maxLength={4000}
                    placeholder={t.project.detailsPlaceholder}
                    className={`${field} resize-y`}
                  />
                </Field>
                <Field label={t.project.reference} hint={t.about.optional}>
                  <input
                    name="reference"
                    value={v.reference}
                    onChange={set("reference")}
                    inputMode="url"
                    maxLength={160}
                    placeholder={t.project.referencePlaceholder}
                    className={field}
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.project.deadline} hint={t.about.optional}>
                    <select
                      name="deadline"
                      value={v.deadline}
                      onChange={set("deadline")}
                      className={field}
                    >
                      <option value="" />
                      {t.project.deadlines.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.project.budget} hint={t.about.optional}>
                    <select name="budget" value={v.budget} onChange={set("budget")} className={field}>
                      <option value="" />
                      {t.project.budgets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* honeypot: fora da tela e fora da ordem de tab; humano não preenche */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" value={v.website} onChange={set("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        {step > 0 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={sending}
            className="btn-brut-ghost px-7 py-4 text-lg disabled:opacity-60"
          >
            ← {t.steps.back}
          </button>
        )}
        <button
          type="submit"
          disabled={sending}
          className="btn-brut px-9 py-4 text-lg disabled:translate-y-0 disabled:opacity-60"
        >
          {sending ? t.sending : `${last ? t.submit : t.steps.next} →`}
        </button>
      </div>
      <p className="mt-5 max-w-xl text-xs leading-relaxed text-muted">{t.privacy}</p>
      {status === "failed" && (
        <p role="alert" className="mt-4 max-w-xl text-sm text-red-700">
          {t.errors.generic}
        </p>
      )}
    </form>
  );
}
