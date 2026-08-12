export function LegalPage({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-4xl pb-12">
      <header className="border-b border-slate-950/[0.07] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{intro}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Last updated: July 23, 2026</p>
      </header>
      <div className="mt-8 space-y-9">{children}</div>
      <div className="mt-10 rounded-xl border border-amber-700/15 bg-amber-50/55 p-4 text-sm leading-6 text-slate-700">
        This page is a technical compliance draft for a personal portfolio and is not a substitute for professional legal advice.
      </div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}