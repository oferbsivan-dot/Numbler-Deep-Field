"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LENGTH = 20;

export default function Home() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("df_name");
    if (saved) setName(saved);
  }, []);

  const focusCell = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (i: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    if (!clean) {
      setDigits((prev) => {
        const next = [...prev];
        next[i] = "";
        return next;
      });
      return;
    }
    const chars = clean.split("");
    setDigits((prev) => {
      const next = [...prev];
      let cursor = i;
      for (const c of chars) {
        if (cursor >= LENGTH) break;
        next[cursor] = c;
        cursor++;
      }
      setTimeout(() => focusCell(Math.min(cursor, LENGTH - 1)), 0);
      return next;
    });
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      focusCell(i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusCell(i - 1);
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      focusCell(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!text) return;
    const next = Array(LENGTH).fill("");
    text
      .slice(0, LENGTH)
      .split("")
      .forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    setTimeout(() => focusCell(Math.min(text.length, LENGTH - 1)), 0);
  };

  const fullNumber = digits.join("");
  const filledCount = digits.filter((d) => d !== "").length;
  const canSubmit = filledCount === LENGTH && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    if (name.trim()) window.localStorage.setItem("df_name", name.trim());
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: fullNumber, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push(`/number/${fullNumber}${data.is_first ? "?first=1" : ""}`);
    } catch {
      setError("Couldn't reach the server. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-14 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-teal mb-4">
            10²⁰ POSSIBLE COORDINATES
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Deep Field
          </h1>
          <p className="text-mist text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            There are a hundred billion billion possible 20-digit numbers.
            Almost none have ever been typed by a human. Point at one and
            find out if anyone got there first.
          </p>
        </div>

        <div
          className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8"
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={2}
              className="digit-cell w-full aspect-square bg-panel border border-line rounded-md text-center font-mono text-lg sm:text-xl text-paper focus:border-gold"
              aria-label={`Digit ${i + 1} of 20`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional — shown if you're first)"
            className="flex-1 bg-panel border border-line rounded-md px-4 py-3 text-sm text-paper placeholder:text-mist focus:outline-none focus:border-teal"
            maxLength={40}
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-gold text-void font-semibold rounded-md px-6 py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {submitting ? "Checking…" : "Submit coordinate"}
          </button>
        </div>
<p className="text-xs text-mist font-mono">
  {filledCount}/20 digits entered
  {error && <span className="text-red-400 ml-3">{error}</span>}
</p>

<div className="mt-10 text-center">
  
    href="/stats"
    className="text-xs text-mist hover:text-teal font-mono tracking-wide"
  >
    view the field report →
  </a>
</div>
</div>
</main>
        
  );
}
