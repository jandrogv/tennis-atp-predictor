import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/about-project"]);

const capabilities = [
  {
    title: "Data engineering",
    description: "Historical matches, rankings, players and tournaments are normalized into a consistent chronological analytical layer."
  },
  {
    title: "Tennis-specific analytics",
    description: "ATP context, Elo, surface strength, head-to-head history and rolling form describe each matchup from several perspectives."
  },
  {
    title: "Probabilistic modeling",
    description: "Candidate classifiers are compared with a ranking baseline and evaluated for discrimination, error and probability quality."
  },
  {
    title: "Data product delivery",
    description: "Curated publication datasets power responsive player, ranking, tournament, prediction and model-transparency experiences."
  }
];

const stages = [
  ["Public tennis data", "Match, player, ranking and tournament records provide the source evidence."],
  ["Normalization", "Identifiers, dates, surfaces and numeric fields are standardized and validated."],
  ["Chronological history", "Completed matches are ordered before sequential player state is calculated."],
  ["Feature engineering", "Comparative ranking, form, matchup, serve and rating signals are prepared."],
  ["Model comparison", "Learned probabilities are assessed against an understandable ATP-ranking baseline."],
  ["Publication", "Only compact web-ready outputs cross the boundary into the public application."]
];

export default function AboutProjectPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Portfolio case study"
        title="From tennis history to a public analytics product"
        description="ATP Insight brings data engineering, sequential sports analytics, machine learning and frontend delivery into one responsible end-to-end project."
      />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Project capabilities">
        {capabilities.map((capability) => (
          <Card key={capability.title}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">{capability.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{capability.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-8 text-white shadow-lift sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Architecture</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">A private analytical system with a deliberate public boundary</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Acquisition, feature generation, training and model artifacts remain private. The public product receives only approved analytical outputs needed for the interface, keeping operational code and raw data outside the deployed application.
        </p>
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {stages.map(([title, description], index) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <span className="text-xs font-semibold text-lime-300">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Evaluation posture</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The current model is evaluated on a later-season holdout and compared with the higher-ranked-player baseline. Accuracy and ROC AUC are reported alongside Brier score, log loss and calibration error.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The published metrics are experimental. A separate post-selection lockbox and stricter proof of pre-match timing for every Elo-derived signal remain roadmap priorities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Responsible use</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Predictions cannot observe every injury, fatigue, travel or tactical factor. They are analytical estimates from available historical evidence, not guarantees and not betting advice.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Limitations and uncertainty are part of the product story because transparent constraints make model results more useful and credible.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
