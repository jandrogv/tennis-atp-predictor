import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  GitCompareArrows,
  Layers3,
  LineChart,
  PanelsTopLeft,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { HeroBackgroundMedia } from "@/components/home/HeroBackgroundMedia";
import { SectionReveal, ScrollRevealCard } from "@/components/home/SectionReveal";

const overviewItems = [
  {
    title: "Data pipeline",
    description: "Raw ATP data is cleaned into model-ready match layers.",
    icon: Database
  },
  {
    title: "Prediction layer",
    description: "Elo, rankings, form and matchup signals become win probabilities.",
    icon: BrainCircuit
  },
  {
    title: "Product interface",
    description: "Predictions, rankings, players and diagnostics live in one web app.",
    icon: PanelsTopLeft
  },
  {
    title: "Portfolio case",
    description: "The project connects data engineering, ML evaluation and frontend delivery.",
    icon: Sparkles
  }
];

const pipelineMilestones = [
  {
    label: "01",
    title: "Data ingestion",
    description: "ATP sources and local raw files are collected.",
    icon: Database
  },
  {
    label: "02",
    title: "Feature layer",
    description: "Match history becomes tennis-specific model signals.",
    icon: Layers3
  },
  {
    label: "03",
    title: "Model scoring",
    description: "The selected model scores upcoming matches.",
    icon: BrainCircuit
  },
  {
    label: "04",
    title: "Web delivery",
    description: "Compact CSVs power the public Next.js app.",
    icon: FileText
  }
];

const featureLinks = [
  {
    title: "Predictions",
    href: "/predictions",
    description: "Upcoming matches with probabilities and confidence context.",
    icon: BrainCircuit,
    accent: "from-lime-200/80 via-lime-100/60 to-white/40"
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Compare players, rankings and Elo history.",
    icon: GitCompareArrows,
    accent: "from-white via-slate-100/90 to-lime-50/70"
  },
  {
    title: "Players",
    href: "/players",
    description: "Browse player profiles and recent tennis context.",
    icon: Search,
    accent: "from-emerald-100/80 to-white/50"
  },
  {
    title: "Elo Rankings",
    href: "/rankings/elo",
    description: "Custom strength ratings by overall and surface Elo.",
    icon: LineChart,
    accent: "from-lime-100/95 to-white/50"
  },
  {
    title: "ATP Rankings",
    href: "/rankings/atp",
    description: "Official ranking snapshots and ATP points.",
    icon: Trophy,
    accent: "from-amber-100/90 to-white/50"
  },
  {
    title: "Tournaments",
    href: "/tournaments",
    description: "Tournament metadata and completed matches.",
    icon: Database,
    accent: "from-slate-100/90 to-white/50"
  },
  {
    title: "Model Performance",
    href: "/model",
    description: "Metrics, baseline comparison and calibration views.",
    icon: BarChart3,
    accent: "from-lime-200/70 via-white/70 to-white/50"
  },
  {
    title: "Feature Importance",
    href: "/feature-importance",
    description: "The model signals that matter most.",
    icon: Sparkles,
    accent: "from-emerald-100/80 via-white/70 to-white/50"
  }
];

const portfolioValues = [
  "Data extraction",
  "Data cleaning",
  "Feature engineering",
  "ML evaluation",
  "Predictive analytics",
  "Frontend data visualization",
  "Product thinking",
  "End-to-end pipeline"
];

export const metadata: Metadata = createPageMetadata(staticPageSeo["/"]);

export default function HomePage() {
  return (
    <div
      className="relative -mt-8 min-h-screen overflow-hidden bg-[#f7f8f0] pb-0 lg:-mt-12"
      style={{ marginLeft: "calc(50% - 50vw)", width: "100vw" }}
    >
      <HomeAtmosphere />
      <div className="relative z-10">
        <HeroSection />
        <SectionReveal index={1}>
          <OverviewSection />
        </SectionReveal>
        <SectionReveal index={2}>
          <PipelineStory />
        </SectionReveal>
        <SectionReveal index={3}>
          <PlatformFeatures />
        </SectionReveal>
        <SectionReveal index={4}>
          <PortfolioValueSection />
        </SectionReveal>
      </div>
    </div>
  );
}
function HeroSection() {
  return (
    <section className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden bg-slate-950 px-4 text-white sm:px-6 lg:px-8">
      <HeroBackgroundMedia />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.26)_0%,rgba(5,8,22,0.18)_35%,rgba(5,8,22,0.32)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(248,250,252,0.10),transparent_28rem),radial-gradient(circle_at_50%_100%,rgba(190,242,100,0.18),transparent_34rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7f8f0] via-[#f7f8f0]/35 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-[82rem] flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-24">
        <SectionReveal className="mx-auto max-w-[76rem]" index={0}>
          <h1 className="text-balance text-[clamp(3.25rem,8.3vw,8.8rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-white drop-shadow-[0_24px_72px_rgba(0,0,0,0.42)]">
            ATP match predictions,
            <span className="block">explained by data.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-7 text-slate-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:mt-6 sm:text-lg sm:leading-8">
            Calibrated probabilities, Elo signals and player context in one clean tennis intelligence layer.
          </p>
        </SectionReveal>
        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center text-white/75 sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll to explore</span>
          <span className="mt-3 h-8 w-px bg-gradient-to-b from-lime-200/80 to-white/0" />
        </div>
      </div>
    </section>
  );
}

function OverviewSection() {
  return (
    <LandingBand innerClassName="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
      <div>
        <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
          A tennis prediction project shaped like a product.
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          ATP Insight turns match history into a compact product layer for predictions, rankings, players and model diagnostics.
        </p>
        <Link href="/about-project" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm xl:min-h-0 font-semibold text-court-grass transition hover:text-lime-700">
          Read the full project breakdown
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {overviewItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <ScrollRevealCard key={item.title} index={index} className="h-full">
              <div className="h-full rounded-[1.35rem] border border-slate-950/[0.06] bg-white/62 p-5 shadow-card backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-lime-300/55 hover:bg-white/78 hover:shadow-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-300/45 bg-lime-100/50 text-court-grass">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </ScrollRevealCard>
          );
        })}
      </div>
    </LandingBand>
  );
}

function PipelineStory() {
  return (
    <LandingBand innerClassName="space-y-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          className="max-w-3xl"
          eyebrow="Pipeline summary"
          title="From raw data to a prediction product."
          description="The complete eight-step workflow lives in About Project. Home keeps the production story to four milestones."
        />
        <Link href="/about-project" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full xl:min-h-0 border border-slate-950/[0.08] bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-lime-300/60 hover:bg-white/80 hover:text-slate-950">
          Full methodology
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-[1.65rem] border border-slate-950/[0.055] bg-white/52 p-5 shadow-card backdrop-blur-sm sm:p-7 lg:p-9">
        <div className="absolute left-9 right-9 top-[3.2rem] hidden h-px bg-slate-950/[0.09] lg:block" />
        <div className="grid gap-5 lg:grid-cols-4">
          {pipelineMilestones.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollRevealCard key={step.title} index={index} className="relative h-full">
                <div className="relative flex h-full flex-col rounded-[1.25rem] border border-transparent p-4 transition duration-300 hover:border-lime-300/40 hover:bg-white/55">
                  <div className="flex items-center gap-3 lg:block">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-950/[0.08] bg-slate-950 text-xs font-bold text-white shadow-sm transition duration-300 group-hover:bg-lime-300 group-hover:text-slate-950">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-lime-300/45 bg-lime-50/80 px-2.5 py-1 text-[11px] font-semibold text-court-grass lg:mt-8 lg:inline-flex">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </ScrollRevealCard>
            );
          })}
        </div>
      </div>
    </LandingBand>
  );
}

function PlatformFeatures() {
  return (
    <LandingBand innerClassName="space-y-10">
      <SectionHeading
        className="max-w-4xl"
        eyebrow="Product surfaces"
        title="Explore the product surfaces"
        description="Predictions, rankings, players and model diagnostics in one interface."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureLinks.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <ScrollRevealCard key={feature.href} index={index} className="h-full">
              <Link href={feature.href} className="group block h-full">
                <div className="relative flex h-full min-h-[14.5rem] overflow-hidden rounded-[1.35rem] border border-slate-950/[0.06] bg-white/68 p-5 shadow-card backdrop-blur-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-lime-300/70 group-hover:shadow-lift">
                  <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${feature.accent}`} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-5deg] group-hover:scale-105">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="rounded-full border border-lime-300/60 bg-lime-50/80 px-2.5 py-1 text-xs font-semibold text-court-grass">
                        Open
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{feature.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{feature.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-court-grass">
                      Explore surface
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollRevealCard>
          );
        })}
      </div>
    </LandingBand>
  );
}

function PortfolioValueSection() {
  return (
    <section className="relative flex min-h-[72vh] items-center overflow-hidden px-6 py-24 sm:px-8 lg:px-10 lg:py-32 xl:px-12">
      <div className="relative mx-auto max-w-[86rem] overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_34px_100px_rgba(15,23,42,0.25)] sm:p-8 lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(190,242,100,0.23),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Portfolio value</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              From raw ATP data to a usable prediction product.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore the predictions, compare players, inspect the model or read how the project is built.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/predictions" size="lg" className="rounded-full bg-lime-300 px-6 text-slate-950 hover:bg-lime-200">
                View predictions
              </LinkButton>
              <LinkButton href="/compare" variant="outline" size="lg" className="rounded-full border-white/20 px-6 text-white hover:bg-white/10">
                Compare players
              </LinkButton>
              <LinkButton href="/model" variant="ghost" size="lg" className="rounded-full px-6 text-slate-200 hover:bg-white/10 hover:text-white">
                Inspect model
              </LinkButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {portfolioValues.map((value, index) => (
              <ScrollRevealCard key={value} index={index} className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-medium text-slate-200 transition duration-300 hover:-translate-y-1 hover:border-lime-300/30 hover:bg-white/10">
                  <CheckCircle2 className="mb-3 h-4 w-4 text-lime-300" aria-hidden="true" />
                  {value}
                </div>
              </ScrollRevealCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  className = "max-w-3xl"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-court-grass">{eyebrow}</p> : null}
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  );
}

function LandingBand({
  children,
  className = "",
  innerClassName
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section className={`relative flex min-h-[62vh] items-center overflow-hidden px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-12 ${className}`}>
      <div className={`relative mx-auto w-full max-w-[86rem] ${innerClassName ?? ""}`}>{children}</div>
    </section>
  );
}

function HomeAtmosphere() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_4%_2%,rgba(190,242,100,0.34),transparent_31rem),radial-gradient(circle_at_96%_9%,rgba(255,255,255,0.82),transparent_34rem),radial-gradient(circle_at_76%_58%,rgba(190,242,100,0.12),transparent_28rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_38%,rgba(190,242,100,0.16),transparent_24rem),radial-gradient(circle_at_92%_48%,rgba(190,242,100,0.15),transparent_26rem),radial-gradient(circle_at_18%_78%,rgba(190,242,100,0.13),transparent_22rem),radial-gradient(circle_at_78%_88%,rgba(190,242,100,0.12),transparent_24rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(132,204,22,0.12)_0_1px,transparent_1.7px)] bg-[size:76px_76px] opacity-[0.18] [mask-image:linear-gradient(180deg,transparent_0%,black_24%,black_86%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-55 [mask-image:linear-gradient(180deg,black_0%,black_28%,transparent_86%)]" />
    </>
  );
}
