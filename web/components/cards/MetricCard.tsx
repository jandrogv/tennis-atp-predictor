import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card className="atp-card-interactive h-full overflow-hidden">
      <CardContent className="flex h-full flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">{value}</p>
        </div>
        {detail ? <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
