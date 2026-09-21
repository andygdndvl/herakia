"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useLang, localize } from "@/components/i18n/LangProvider";
import { SERVICES_DATA, ServiceContent } from "@/data/servicesData";
import { Navbar } from "@/components/layout/Navbar";

export default function ServiceDetailPage() {
  const params = useParams();
  const lang = useLang();
  const serviceId = params?.id as string;

  const currentLangData =
    SERVICES_DATA[lang as "fr" | "en"] || SERVICES_DATA.fr;
  const service: ServiceContent | undefined = currentLangData[serviceId];

  if (!service) {
    notFound();
  }

  const contactHref = localize(lang, "/contact");

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-primary text-text-primary">
        {/* 1. Hero */}
        <section className="relative overflow-hidden px-6 pt-36 pb-20 lg:px-8">
          <div className="relative mx-auto max-w-5xl">
            {/* Bouton Retour aux services placé proprement sous la Navbar */}
            <div className="mb-8">
              <Link
                href={localize(lang, "/services")}
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary/50 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-text-secondary transition-all hover:border-border-green hover:text-green-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Tous les services</span>
              </Link>
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold md:text-6xl lg:text-7xl">
              {service.heroTitleLead}
              <span className="text-green-primary">
                {service.heroTitleAccent}
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg text-text-secondary md:text-xl">
              {service.heroSubtitle}
            </p>

            <div className="mt-8">
              <Link
                href={contactHref}
                className="inline-flex items-center gap-2 rounded-xl bg-green-primary px-6 py-3.5 font-mono text-xs uppercase font-bold text-bg-primary transition-transform hover:scale-105"
              >
                <span>{service.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Image / Visuel */}
        <section className="px-6 pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated">
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* 3. Challenge vs Solution */}
        <section className="border-y border-border-subtle bg-bg-secondary/30 px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-8">
              <span className="font-mono text-xs text-text-muted">
                01 / CHALLENGE
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold">
                {service.problemTitle}
              </h3>
              <p className="mt-4 text-text-secondary">{service.problemText}</p>
            </div>
            <div className="rounded-2xl border border-border-green/40 bg-bg-elevated p-8">
              <span className="font-mono text-xs text-green-primary">
                02 / SOLUTION
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold">
                {service.solutionTitle}
              </h3>
              <p className="mt-4 text-text-secondary">{service.solutionText}</p>
            </div>
          </div>
        </section>

        {/* 4. Cas d'usage */}
        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold">
              {service.casesTitle}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {service.useCases.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-6"
                >
                  <Zap className="h-6 w-6 text-green-primary" />
                  <h4 className="mt-4 font-display text-lg font-bold">
                    {uc.title}
                  </h4>
                  <p className="mt-2 text-sm text-text-secondary">
                    {uc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Méthode / Étapes */}
        <section className="border-t border-border-subtle bg-bg-secondary/20 px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold">
              {service.stepsTitle}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-6"
                >
                  <span className="font-mono text-2xl font-bold text-green-primary">
                    {step.number}
                  </span>
                  <h4 className="mt-2 font-display text-base font-bold">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-xs text-text-secondary">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Livrables & CTA */}
        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-border-green/30 bg-bg-elevated p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <h3 className="font-display text-2xl font-bold">
                  {service.deliverablesTitle}
                </h3>
                <ul className="mt-4 space-y-2">
                  {service.deliverables.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-primary px-6 py-3.5 font-mono text-xs uppercase font-bold text-bg-primary"
                >
                  <span>{service.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}