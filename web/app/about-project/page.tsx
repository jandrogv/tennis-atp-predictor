import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  LineChart,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPageMetadata, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/about-project"]);

type IconCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

type PipelineStep = {
  number: string;
  title: string;
  body: string;
  detail: string;
  output: string;
};

const overviewCards: IconCard[] = [
  {
    title: "Pipeline",
    body: "An analytical workflow collects, cleans and prepares ATP tennis data before it reaches the web layer.",
    icon: Database
  },
  {
    title: "Model",
    body: "Precomputed tennis signals become match probabilities, model diagnostics and feature importance views.",
    icon: BrainCircuit
  },
  {
    title: "Web product",
    body: "A static Next.js app turns selected web-friendly CSVs into predictions, rankings and player exploration.",
    icon: Globe2
  }
];

const pipelineSteps: PipelineStep[] = [
  {
    number: "01",
    title: "Scraping ATP data",
    body: "Tournament, ranking, match and player sources are collected and prepared.",
    detail: "Data acquisition stays outside the deployed web app and provides only the records required by later stages.",
    output: "Raw tournament, player, ranking and match files"
  },
  {
    number: "02",
    title: "Data cleaning & normalization",
    body: "Player names, IDs, rankings and tournament metadata are standardized.",
    detail: "The goal is to keep downstream feature engineering reproducible across runs.",
    output: "Clean player, tournament, ranking and match layers"
  },
  {
    number: "03",
    title: "Preprocessing",
    body: "Historical matches are separated from current test and upcoming prediction-only rows.",
    detail: "Training, evaluation and prediction data keep different roles in the pipeline.",
    output: "Train, test and prediction-ready match layers"
  },
  {
    number: "04",
    title: "Feature engineering",
    body: "The pipeline creates Elo, surface Elo, ranking, H2H, recent-form and rolling match-stat signals.",
    detail: "Feature contracts are saved so prediction uses the same columns expected by the model.",
    output: "Model-ready feature tables"
  },
  {
    number: "05",
    title: "Model training & evaluation",
    body: "Offline training compares model candidates and evaluates the selected result.",
    detail: "Metrics are reviewed through the Model Performance page instead of hardcoded copy.",
    output: "Metrics, selected model and feature importance"
  },
  {
    number: "06",
    title: "Prediction generation",
    body: "Upcoming matches are scored with the selected model using prediction-only features.",
    detail: "This stage does not train or evaluate; it only applies the existing model contract.",
    output: "Win probabilities for upcoming ATP matches"
  },
  {
    number: "07",
    title: "Web-friendly data layer",
    body: "Final outputs are consolidated into compact CSVs designed for frontend consumption.",
    detail: "The web layer avoids raw datasets and reads only selected public CSV files.",
    output: "Match cards, details, rankings, profiles and diagnostics"
  },
  {
    number: "08",
    title: "Interactive web application",
    body: "Next.js renders the product surfaces from static CSVs served with the app.",
    detail: "Vercel hosts the frontend; the analytical workflow remains separate from the deployed app.",
    output: "Portfolio-ready ATP Insight web interface"
  }
];

const featureFamilies: IconCard[] = [
  {
    title: "Ranking context",
    body: "ATP rank and points differences help represent official pre-match strength signals.",
    icon: Gauge
  },
  {
    title: "Matchup history",
    body: "Head-to-head and surface head-to-head fields add prior matchup context when available.",
    icon: GitBranch
  },
  {
    title: "Recent form",
    body: "Rolling win-rate windows and recent match statistics capture short and medium-term momentum.",
    icon: LineChart
  },
  {
    title: "Elo signals",
    body: "Overall Elo and surface Elo families describe tennis strength in a model-ready format.",
    icon: Layers3
  }
];

const stackGroups = [
  {
    title: "Data pipeline",
    items: ["Python", "Pandas", "Web scraping", "Cleaning", "Feature engineering", "CSV artifacts"]
  },
  {
    title: "Machine learning",
    items: ["scikit-learn", "XGBoost", "TensorFlow available", "Calibration", "ROC AUC", "Feature importance"]
  },
  {
    title: "Web product",
    items: ["Next.js", "React", "TypeScript", "Tailwind", "Static CSVs", "Vercel"]
  },
  {
    title: "Ops / delivery",
    items: ["Version control", "Reproducible updates", "Delivery workflow", "Vercel build", "Documentation", "No live database"]
  }
];

const decisions: IconCard[] = [
  {
    title: "Static CSVs first",
    body: "The current portfolio stage favors static web-friendly CSVs over a database or custom API.",
    icon: FileText
  },
  {
    title: "Raw data stays outside the public app",
    body: "The deployed app receives selected public outputs, not raw or heavy internal datasets.",
    icon: ShieldCheck
  },
  {
    title: "Product pages over notebooks",
    body: "Predictions, rankings, players and diagnostics are presented as browsable product surfaces.",
    icon: PanelsTopLeft
  },
  {
    title: "Curated updates before deploy",
    body: "Data preparation, model evaluation and consolidation are completed before selected CSVs are shipped with the web app.",
    icon: CheckCircle2
  }
];

const limitations = [
  "Predictions are experimental and should not be interpreted as betting advice.",
  "Model performance depends on data quality, feature availability and the selected training run.",
  "Data acquisition can require maintenance if source page structures change.",
  "Static CSV delivery is intentional now, but a database or API may become useful if the data layer grows.",
  "Training remains separate from the deployed app and follows a reproducible offline process."
];

const futureItems: IconCard[] = [
  {
    title: "Simplify Home",
    body: "Move detailed methodology out of the landing page and keep Home focused on routing and first impression.",
    icon: Sparkles
  },
  {
    title: "Review navigation",
    body: "Decide where About Project belongs after the page exists and the topbar density can be judged.",
    icon: PanelsTopLeft
  },
  {
    title: "Improve explanation",
    body: "Continue refining calibration, local explanation and confidence context around individual predictions.",
    icon: BrainCircuit
  },
  {
    title: "Automate carefully",
    body: "Explore controlled automation later without rushing cloud scraping or heavy training into deployment.",
    icon: Gauge
  }
];

function SectionIntro({
  label,
  title,
  children
}: {
  label?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-700">{label}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      {children ? <div className="mt-3 text-sm leading-7 text-slate-600">{children}</div> : null}
    </div>
  );
}

function SmallIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/35 bg-lime-100/45 text-lime-800">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function FeatureCard({ title, body, icon }: IconCard) {
  return (
    <Card className="p-5">
      <SmallIcon icon={icon} />
      <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Card>
  );
}

function PipelineTimeline() {
  return (
    <div className="relative grid gap-4 lg:grid-cols-2">
      <div className="pointer-events-none absolute left-6 top-4 hidden h-[calc(100%-2rem)] w-px bg-slate-950/[0.08] lg:block" />
      {pipelineSteps.map((step) => (
        <Card key={step.number} className="relative p-5">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lime-300/45 bg-lime-100/55 text-xs font-bold text-lime-800">
              {step.number}
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{step.detail}</p>
              <div className="mt-4 rounded-lg border border-slate-950/[0.06] bg-white/55 p-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Output</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{step.output}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FlowDiagram() {
  const items = ["Analytical workflow", "Curated outputs", "Public data layer", "Next.js", "Vercel"];

  return (
    <div className="atp-panel p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-5">
        {items.map((item, index) => (
          <div key={item} className="relative">
            <div className="flex min-h-20 items-center justify-center rounded-xl border border-slate-950/[0.06] bg-white/55 px-3 text-center text-sm font-semibold text-slate-800">
              {item}
            </div>
            {index < items.length - 1 ? (
              <ArrowRight
                className="absolute -right-5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-lime-700 sm:block"
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutProjectPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 pb-12">
      <header className="mx-auto max-w-3xl pt-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">About Project</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          A documented view of how ATP Insight turns tennis data into a usable prediction product.
        </p>
      </header>

      <section className="space-y-6">
        <SectionIntro label="Project overview" title="A data science project shaped like a product">
          <p>
            ATP Insight is a personal data science and product project that turns ATP tennis data into match
            probabilities, rankings, player views and model diagnostics. It combines a reproducible analytical workflow with a
            static Next.js app so the result can be explored like a real product, not only a notebook.
          </p>
        </SectionIntro>
        <div className="grid gap-4 md:grid-cols-3">
          {overviewCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="atp-dark-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300">The problem</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            A prediction is only useful if the signals can be inspected.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Tennis context changes by surface, ranking, recent form and matchup history. ATP Insight treats the web
            interface as part of the model output: users can inspect probabilities, compare players and review model
            diagnostics instead of seeing a number in isolation.
          </p>
        </div>
        <Card className="p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Surface context", "Elo signals", "ATP rankings", "Recent form", "Head-to-head", "Model output"].map(
              (item) => (
                <div key={item} className="atp-inset p-4">
                  <p className="text-sm font-semibold text-slate-900">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Visible context for understanding a match.</p>
                </div>
              )
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionIntro label="The data" title="Curated data work, selected public outputs">
          <p>
            The public app is intentionally lightweight. Raw and generated training data remain outside the public repository; the deployed web
            app receives only selected web-friendly CSVs.
          </p>
        </SectionIntro>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <SmallIcon icon={Database} />
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">Analytical source data</h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>ATP tournament metadata and completed matches.</li>
              <li>Ranking snapshots, player metadata and upcoming matches.</li>
              <li>Training, evaluation, prediction and model artifacts kept outside the deployed frontend.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <SmallIcon icon={ShieldCheck} />
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">Public web data</h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>Compact CSVs for predictions, players, rankings, tournaments and diagnostics.</li>
              <li>No raw datasets, full training tables or model files are required by React pages.</li>
              <li>Next.js reads static files from the curated public data layer.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Full pipeline" title="From ATP sources to a web-ready prediction layer">
          <p>
            The complete workflow is deliberately explicit: each stage has a clear role, output and boundary between
            analytical data science work and the public web product.
          </p>
        </SectionIntro>
        <PipelineTimeline />
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro label="Feature engineering" title="Signals the model can learn from">
            <p>
              The feature layer turns tennis context into structured model inputs. The exact feature contract is saved
              with model artifacts, while the app exposes the main signal families users can understand.
            </p>
          </SectionIntro>
          <LinkButton href="/feature-importance" variant="secondary" size="sm" className="w-fit">
            View feature importance <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featureFamilies.map((family) => (
            <FeatureCard key={family.title} {...family} />
          ))}
        </div>
      </section>

      <section className="atp-dark-panel p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
              Model training and evaluation
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Metrics stay in the model dashboard, not hardcoded in marketing copy.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Model comparison includes candidates such as XGBoost
              and calibrated XGBoost under a consistent evaluation process. Evaluation artifacts track accuracy, precision, recall, F1, ROC AUC
              and calibration diagnostics when available.
            </p>
            <LinkButton href="/model" variant="subtle" size="sm" className="mt-5">
              Inspect model performance <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Feature contract", "Candidate comparison", "Calibration views", "Diagnostics"].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-semibold text-white">{item}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Generated by the training and evaluation flow.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Prediction generation" title="Upcoming matches use the saved model contract">
          <p>
            Prediction is an application stage, not a training stage. The flow reads upcoming match features, applies
            the selected model contract and writes the latest probability outputs.
          </p>
        </SectionIntro>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Prediction features", "Upcoming match rows with the feature columns required by the selected model."],
            ["Feature contract", "The feature contract that keeps prediction aligned with training."],
            ["Latest predictions", "Generated player win probabilities for the current upcoming match set."]
          ].map(([title, body]) => (
            <Card key={title} className="p-5">
              <p className="font-mono text-xs font-semibold text-lime-700">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Web delivery" title="A static data-product app, hosted separately from the pipeline">
          <p>
            Vercel builds the frontend from the repository. The analytical workflow produces selected
            public CSVs before deployment.
          </p>
        </SectionIntro>
        <FlowDiagram />
      </section>

      <section className="space-y-6">
        <SectionIntro label="Technical stack" title="A practical stack for reproducible data and frontend delivery" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stackGroups.map((group) => (
            <Card key={group.title} className="p-5">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="atp-chip px-2.5 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Product decisions" title="Design and architecture choices behind the current version" />
        <div className="grid gap-4 md:grid-cols-2">
          {decisions.map((decision) => (
            <FeatureCard key={decision.title} {...decision} />
          ))}
        </div>
      </section>

      <section className="atp-dark-panel p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300">Portfolio value</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              A complete example of data science becoming a usable product.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              ATP Insight connects extraction, cleaning, feature engineering, model diagnostics, interpretation,
              documentation, deployment strategy and frontend product design in one project.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["End-to-end data lifecycle", "Production-style web experience", "Model diagnostics", "Operational docs"].map(
              (item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <CheckCircle2 className="h-4 w-4 text-lime-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-white">{item}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Limitations" title="Transparent constraints in the current version">
          <p>
            The project is designed as a professional portfolio product, but the prediction layer remains experimental
            and tied to data quality, feature availability and controlled update flows.
          </p>
        </SectionIntro>
        <Card className="p-6">
          <div className="flex gap-3">
            <SmallIcon icon={AlertTriangle} />
            <div className="grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
              {limitations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionIntro label="Future improvements" title="What comes next" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {futureItems.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="atp-panel p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Explore the product surfaces</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          The methodology lives here; the product pages show the current predictions, model diagnostics and player
          context generated from the pipeline.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/predictions" variant="primary">
            Open predictions
          </LinkButton>
          <LinkButton href="/model" variant="secondary">
            Inspect model performance
          </LinkButton>
          <LinkButton href="/feature-importance" variant="outline">
            View feature importance
          </LinkButton>
          <LinkButton href="/compare" variant="ghost">
            Explore player comparison
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
