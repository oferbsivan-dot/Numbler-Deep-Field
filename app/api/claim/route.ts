import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { detectPattern } from "@/lib/patterns";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawNumber = body?.number;
  const rawName = body?.name;

  if (typeof rawNumber !== "string" || !/^[0-9]{20}$/.test(rawNumber)) {
    return NextResponse.json(
      { error: "A number must be exactly 20 digits (0-9)." },
      { status: 400 }
    );
  }

  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim().slice(0, 40)
      : "an anonymous explorer";

  const pattern = detectPattern(rawNumber);

  const { data, error } = await supabase.rpc("claim_number", {
    p_number: rawNumber,
    p_name: name,
    p_pattern_label: pattern,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong saving that number." },
      { status: 500 }
    );
  }

  const row = data?.[0];
  if (!row) {
    return NextResponse.json(
      { error: "Something went wrong saving that number." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    number: row.out_number,
    first_claimant: row.out_first_claimant,
    first_seen_at: row.out_first_seen_at,
    selection_count: row.out_selection_count,
    is_first: row.out_is_first,
    pattern_label: row.out_pattern_label,
  });
}
