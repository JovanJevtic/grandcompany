import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage, { PoliciesCombined } from "@/components/legal/LegalPage";
import { LEGAL_DOCS, legalBySlug } from "@/lib/legal";

// Pravne i servisne stranice (dostava, povrat, uslovi, privatnost...). Sve se generišu pri buildu;
// nepoznata adresa daje 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...LEGAL_DOCS.map((d) => ({ slug: d.slug })), { slug: "sve-politike" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "sve-politike") return { title: "Sve politike — GRAND COMPANY" };
  const doc = legalBySlug(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} — GRAND COMPANY`,
    description: doc.lead.replace(/\{\w+\}/g, "").replace(/\s+/g, " ").trim() || undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "sve-politike") return <PoliciesCombined />;
  const doc = legalBySlug(slug);
  if (!doc) notFound();
  return <LegalPage doc={doc} />;
}
