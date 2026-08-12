import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Database,
  Gauge,
  GitCompareArrows,
  Globe2,
  Layers3,
  LineChart,
  ShieldCheck,
  Trophy
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPageMetadata, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/about-project"]);

type Capability = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const capabilities: Capability[] = [
  {
    title: "Data engineering",
    body: "Historical matches, rankings, players and tournaments become a consistent chronological analytical layer.",
    icon: Database
  },
  {
    title: "Tennis intelligence",
    body: "Ranking, Elo, surface strength, form, serve performance and matchup history describe each contest.",
    icon: Trophy
  },
  {
    title: "Probabilistic modeling",
    body: "Candidate classifiers are compared with an understandable ranking baseline and assessed for probability quality.",
    icon: BrainCircuit
  },
  {
    title: "Product delivery",
    body: "Curated analytical outputs power a responsive Next.js experience built for exploration and interpretation.",
    icon: Globe2
  }
];

const pipeline = [
  ["Data", "ATP match, player, ranking and tournament history"],
  ["Cleaning", "Stable identities, dates, surfaces and numeric fields"],
  ["Feature engineering", "Pre-match comparisons and rolling player state"],
  ["Ratings", "General Elo and surface-specific Elo context"],
  ["Machine learning", "Candidate models that estimate win probability"],
  ["Evaluation", "Temporal holdout, baseline and calibration diagnostics"],
  ["Predictions", "Interpretable probabilities for upcoming matches"],
  ["Web product", "Players, rankings, tournaments and model transparency"]
];

const featureFamilies: Capability[] = [
  {
    title: "Ranking context",
    body: "ATP position and points describe official strength at the time of the match.",
    icon: Gauge
  },
  {
    title: "Elo by surface",
    body: "General and surface-specific ratings adapt player strength to tennis conditions.",
    icon: Layers3
  },
  {
    title: "Recent form",
    body: "Rolling results and serve-performance windows capture shorter-term evidence.",
    icon: LineChart
  },
  {
    title: "Matchup history",
    body: "Head-to-head and surface matchup records add opponent-specific context.",
    icon: GitCompareArrows
  }
];

const productAreas = [
  {
    title: "Match intelligence",
    body: "Upcoming predictions and match detail combine probability, confidence context, Elo, rankings and head-to-head evidence.",
    links: [
      ["Predictions", "/predictions"],
      ["Compare players", "/compare"]
    ]
  },
  {
    title: "Player and ranking analytics",
    body: "Searchable profiles, ATP standings and general or surface Elo views make player strength explorable over time.",
    links: [
      ["Players", "/players"],
      ["Elo rankings", "/rankings/elo"]
    ]
  },
  {
    title: "Tournament context",
    body: "Tournament pages connect editions, surfaces, draws, played matches and detailed results in one navigable view.",
    links: [["Tournaments", "/tournaments"]]
  },
  {
    title: "Model transparency",
    body: "Performance, baselines, confusion matrix, calibration and feature importance expose how the current model behaves.",
    links: [
      ["Model performance", "/model"],
      ["Feature importance", "/feature-importance"]
    ]
  }
];

const stack = [
  ["Data & ML", "Python, pandas, NumPy, scikit-learn, XGBoost and TensorFlow experimentation"],
  ["Frontend", "Next.js, React, TypeScript, Tailwind CSS, Radix UI primitives and Motion"],
  ["Delivery", "Static web-ready data products, GitHub and Vercel"]
];

function CapabilityCard({ title, body, icon: Icon }: Capability) {
  return (
    <Card className="h-full p-5 sm:p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100/70 text-lime-800">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
    </Card>
  );
}

export default function AboutProjectPage() {
  return (
    <article className="mx-auto max-w-6xl space-y-20 pb-12 sm:space-y-24">
      <header className="grid gap-8 border-b border-slate-950/[0.06] pb-12 pt-2 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-6xl">
            Tennis history, shaped into an analytical product.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            ATP Insight is a personal end-to-end portfolio project combining data engineering, tennis analytics,
            rating systems, machine learning and an interactive web experience for professional men&apos;s tennis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/predictions" size="lg">
              Explore predictions <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <LinkButton href="/model" variant="secondary" size="lg">
              Inspect the model
            </LinkButton>
          </div>
        </div>

        <aside className="atp-dark-panel overflow-hidden p-6 sm:p-7" aria-label="Project outcome">
          <BarChart3 className="h-6 w-6 text-lime-300" aria-hidden="true" />
          <p className="mt-8 text-2xl font-semibold tracking-tight text-white">More than a prediction model</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            The result is a browsable data product where probabilities sit beside the player, surface, tournament and
            model evidence needed to interpret them.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
            <div>
              <p className="text-xl font-semibold tabular-nums text-white">84.57%</p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">Accuracy</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums text-white">0.9209</p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">ROC AUC</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums text-white">0.1117</p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">Brier</p>
            </div>
          </div>
        </aside>
      </header>

      <section aria-labelledby="problem-title" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2 id="problem-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            The problem
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            A ranking alone cannot explain a tennis matchup. Strength changes over time, varies by surface and depends
            on the quality and recency of the evidence.
          </p>
        </div>
        <div className="atp-panel p-6 sm:p-8">
          <p className="max-w-3xl text-xl font-medium leading-9 tracking-tight text-slate-900 sm:text-2xl">
            ATP Insight turns historical ATP records into an interpretable system for analysing players, ratings,
            tournaments and matches &mdash; then estimates win probabilities without presenting them as guarantees.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="border-t border-slate-950/[0.08] pt-4">
                <p className="font-semibold text-slate-950">{capability.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{capability.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="pipeline-title">
        <div className="max-w-3xl">
          <h2 id="pipeline-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            From source records to product decisions
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Each stage has a distinct analytical role. Sequential state is calculated chronologically, evaluation uses
            later-season evidence, and only curated outputs cross into the public application.
          </p>
        </div>
        <ol className="mt-8 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lift">
          {pipeline.map(([title, body], index) => (
            <li
              key={title}
              className="grid gap-3 border-b border-white/10 px-5 py-5 last:border-b-0 sm:grid-cols-[3rem_12rem_1fr] sm:items-center sm:px-7"
            >
              <span className="text-xs font-semibold tabular-nums text-lime-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-slate-300">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="signals-title">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <h2 id="signals-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Tennis signals with temporal context
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Features compare two players using only the evidence intended to be available before the match. The full
              methodology remains documented separately from this visual case study.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featureFamilies.map((feature) => (
              <CapabilityCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">General and surface Elo</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Elo updates strength after each completed match. Parallel surface ratings represent how the same player
              can perform differently on hard, clay and grass courts, giving the model context beyond official rank.
            </p>
            <LinkButton href="/rankings/elo" variant="ghost" size="sm" className="mt-5">
              Explore Elo rankings <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </Card>
          <Card className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Probability, not certainty</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Models are compared under a later-season holdout against the higher-ranked-player baseline. Accuracy and
              discrimination are assessed alongside Brier score, log loss and calibration error so probability quality
              remains part of the decision.
            </p>
            <LinkButton href="/model" variant="ghost" size="sm" className="mt-5">
              Review evaluation <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </Card>
        </div>
      </section>

      <section aria-labelledby="product-title">
        <div className="max-w-3xl">
          <h2 id="product-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            The model becomes a product
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            ATP Insight is designed for exploration rather than blind prediction. Product surfaces connect each output
            to the context a visitor needs to understand it.
          </p>
        </div>
        <div className="mt-8 divide-y divide-slate-950/[0.07] border-y border-slate-950/[0.07]">
          {productAreas.map((area) => (
            <div key={area.title} className="grid gap-4 py-7 lg:grid-cols-[0.7fr_1.3fr_auto] lg:items-center">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">{area.title}</h3>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">{area.body}</p>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {area.links.map(([label, href]) => (
                  <LinkButton key={href} href={href} variant="secondary" size="sm">
                    {label}
                  </LinkButton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="stack-title" className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 id="stack-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One project, three disciplines
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The stack supports a reproducible analytical workflow, a transparent evaluation story and a production
            frontend without requiring live model inference in the browser.
          </p>
        </div>
        <div className="space-y-3">
          {stack.map(([title, technologies]) => (
            <div key={title} className="atp-inset grid gap-2 p-5 sm:grid-cols-[9rem_1fr] sm:items-center">
              <h3 className="font-semibold text-slate-950">{title}</h3>
              <p className="text-sm leading-6 text-slate-600">{technologies}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atp-dark-panel overflow-hidden p-6 sm:p-8 lg:p-10" aria-labelledby="limitations-title">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <ShieldCheck className="h-6 w-6 text-lime-300" aria-hidden="true" />
            <h2 id="limitations-title" className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Transparent by design
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Model limitations are part of the product story, not a footnote. The published results are portfolio
              evidence from an offline evaluation, not production guarantees or betting advice.
            </p>
          </div>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {[
              "Coverage varies across seasons, surfaces and match-stat fields.",
              "New or lower-ranked players have less historical evidence.",
              "Injuries, fatigue, travel and late withdrawals are not fully observable.",
              "Candidate selection and final reporting currently share the same holdout.",
              "Every Elo-derived signal still needs stricter pre-match verification.",
              "Performance may shift as players, conditions and tour patterns change."
            ].map((item) => (
              <p key={item} className="border-t border-white/10 pt-4 text-sm leading-6 text-slate-300">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="atp-panel p-6 text-center sm:p-10">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Explore ATP Insight</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Start with the product, inspect how the model behaves, or explore the player and tournament context behind
          the predictions.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <LinkButton href="/predictions">Open predictions</LinkButton>
          <LinkButton href="/players" variant="secondary">
            Browse players
          </LinkButton>
          <LinkButton href="/tournaments" variant="outline">
            Explore tournaments
          </LinkButton>
        </div>
      </section>
    </article>
  );
}
