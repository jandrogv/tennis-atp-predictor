import { Badge } from "@/components/ui/badge";
import { formatNullable, surfaceTone } from "@/lib/formatters";

export function SurfaceBadge({ surface }: { surface: string }) {
  return <Badge tone={surfaceTone(surface)}>{formatNullable(surface)}</Badge>;
}
