import { supabase } from "@/lib/supabase";
import { PATTERN_LABELS } from "@/lib/patterns";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Where this number falls along the full 0 - 10^20 line, as a percentage,
// purely for the visual bar below. Approximate is fine here — this is
// illustrative, not the source of truth (the database stores the exact
// digit string).
function positionPercent(digits: string): number {
  const leading = parseFloat(`0.${digits}`);
  return Math.max(0.15, leading * 100);
}

export default async function NumberPage({
  params,
  searchParams,
}: {
  params: { number: string };
  searchParams: { first?: string };
}) {
  const number = params.number;

  if (!/^[0-9]{20}$/.test(number)) {
    notFound();
  }

  const { data, error } = await supabase
    .from("numbers")
    .select("*")
    .eq("number", number)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const justClaimed = searchParams.first === "1";
  const pct = positionPercent(number);

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-xs text-mist hover:text-teal font-mono">
          ← back to Deep Field
        </Link>

        {justClaimed && (
          <div className="mt-6 mb-2 bg-gold/10 border border-gold/40 rounded-md px-4 py-3 text-gold text-sm font-medium">
            You're the first person ever to point at this coordinate.
          </div>
        )}

        <h1 className="font-mono text-2xl sm:text-4xl tracking-wider break-all mt-6 mb-6 text-paper">
          {number}
        </h1>

        {data.pattern_label && (
          <span className="inline-block bg-teal/10 border border-teal/40 text-teal text-xs font-mono tracking-wide rounded-full px-3 py-1 mb-6">
            {PATTERN_LABELS[data.pattern_label] ?? data.pattern_label}
          </span>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-panel border border-line rounded-lg px-5 py-4">
            <p className="text-xs text-mist mb-1 font-mono tracking-wide">
              FIRST OBSERVED BY
            </p>
            <p className="text-paper font-medium">{data.first_claimant}</p>
            <p className="text-xs text-mist mt-1">
              {formatDate(data.first_seen_at)}
            </p>
          </div>
          <div className="bg-panel border border-line rounded-lg px-5 py-4">
            <p className="text-xs text-mist mb-1 font-mono tracking-wide">
              TIMES SELECTED
            </p>
            <p className="text-paper font-medium text-xl">
              {data.selection_count.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-xs text-mist mb-2 font-mono tracking-wide">
            POSITION IN THE FIELD (0 → 10²⁰)
          </p>
          <div className="relative h-2 bg-line rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1 bg-gold rounded-full"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-mist leading-relaxed">
          There are 100,000,000,000,000,000,000 possible 20-digit
          coordinates. This is one of the vanishingly few that a human has
          actually visited.
        </p>
      </div>
    </main>
  );
}
