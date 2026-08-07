import { supabase } from "@/lib/supabase";
import { PATTERN_LABELS } from "@/lib/patterns";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NumberRow({
  number,
  first_claimant,
  right,
}: {
  number: string;
  first_claimant: string;
  right: string;
}) {
  return (
    <Link
      href={`/number/${number}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-line/40 transition"
    >
      <div className="min-w-0">
        <p className="font-mono text-sm text-paper truncate">{number}</p>
        <p className="text-xs text-mist truncate">{first_claimant}</p>
      </div>
      <span className="text-xs text-teal font-mono ml-4 shrink-0">
        {right}
      </span>
    </Link>
  );
}

export default async function StatsPage() {
  const [{ count: totalNumbers }, totalsResult, mostSelected, mostRecent, patterns] =
    await Promise.all([
      supabase.from("numbers").select("*", { count: "exact", head: true }),
      supabase.rpc("total_selections").then(
        (r) => r,
        () => ({ data: null })
      ),
      supabase
        .from("numbers")
        .select("number, first_claimant, selection_count")
        .order("selection_count", { ascending: false })
        .limit(10),
      supabase
        .from("numbers")
        .select("number, first_claimant, first_seen_at")
        .order("first_seen_at", { ascending: false })
        .limit(10),
      supabase
        .from("numbers")
        .select("number, first_claimant, pattern_label")
        .not("pattern_label", "is", null)
        .order("first_seen_at", { ascending: false })
        .limit(10),
    ]);

  // total_selections is an optional helper function — if it isn't set up,
  // fall back to summing selection_count client-side from the numbers we
  // already have (mostSelected won't cover all rows, so this is best-effort).
  const totalSelections = totalsResult?.data ?? null;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-xs text-mist hover:text-teal font-mono">
          ← back to Deep Field
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-6 mb-2">
          Field Report
        </h1>
        <p className="text-mist text-sm mb-10">
          What's been found so far, out of 10²⁰ possible coordinates.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border border-line rounded-lg px-5 py-4">
            <p className="text-xs text-mist mb-1 font-mono tracking-wide">
              COORDINATES CLAIMED
            </p>
            <p className="text-2xl font-semibold text-paper">
              {(totalNumbers ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-panel border border-line rounded-lg px-5 py-4">
            <p className="text-xs text-mist mb-1 font-mono tracking-wide">
              TOTAL SELECTIONS
            </p>
            <p className="text-2xl font-semibold text-paper">
              {totalSelections !== null
                ? Number(totalSelections).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        <section className="mb-12">
          <p className="text-xs text-mist mb-3 font-mono tracking-wide">
            MOST SELECTED
          </p>
          <div className="bg-panel border border-line rounded-lg divide-y divide-line">
            {mostSelected.data && mostSelected.data.length > 0 ? (
              mostSelected.data.map((n) => (
                <NumberRow
                  key={n.number}
                  number={n.number}
                  first_claimant={n.first_claimant}
                  right={`${n.selection_count}×`}
                />
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-mist">
                No coordinates claimed yet.
              </p>
            )}
          </div>
        </section>

        <section className="mb-12">
          <p className="text-xs text-mist mb-3 font-mono tracking-wide">
            RECENTLY DISCOVERED
          </p>
          <div className="bg-panel border border-line rounded-lg divide-y divide-line">
            {mostRecent.data && mostRecent.data.length > 0 ? (
              mostRecent.data.map((n) => (
                <NumberRow
                  key={n.number}
                  number={n.number}
                  first_claimant={n.first_claimant}
                  right={formatDate(n.first_seen_at)}
                />
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-mist">
                No coordinates claimed yet.
              </p>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs text-mist mb-3 font-mono tracking-wide">
            PATTERN FINDS
          </p>
          <div className="bg-panel border border-line rounded-lg divide-y divide-line">
            {patterns.data && patterns.data.length > 0 ? (
              patterns.data.map((n) => (
                <NumberRow
                  key={n.number}
                  number={n.number}
                  first_claimant={n.first_claimant}
                  right={PATTERN_LABELS[n.pattern_label ?? ""] ?? "pattern"}
                />
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-mist">
                No pattern coordinates found yet — try a palindrome or a
                repeating sequence.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
