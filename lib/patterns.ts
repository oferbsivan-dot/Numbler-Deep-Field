// Detects whether a 20-digit string has a recognizable structure.
// This runs once, at the moment a number is first claimed, and the
// resulting label is stored permanently on the number's record.

export function detectPattern(digits: string): string | null {
  const d = digits.split("").map(Number);

  if (d.every((n) => n === d[0])) {
    return "REPDIGIT"; // e.g. 11111111111111111111
  }

  if (digits === digits.split("").reverse().join("")) {
    return "PALINDROME"; // e.g. 12344321432112344321... reads the same backward
  }

  const isAscending = d.every((n, i) => i === 0 || n === (d[i - 1] + 1) % 10);
  if (isAscending) return "ASCENDING";

  const isDescending = d.every((n, i) => i === 0 || n === (d[i - 1] + 9) % 10);
  if (isDescending) return "DESCENDING";

  // Repeating block: the whole string is one short sequence repeated
  // (e.g. "1234" repeated five times to make 20 digits).
  for (const blockLen of [1, 2, 4, 5, 10]) {
    if (blockLen >= 20) continue;
    const block = digits.slice(0, blockLen);
    const repeated = block.repeat(20 / blockLen);
    if (repeated === digits) return "REPEATING_BLOCK";
  }

  // Mostly zeros with one non-zero digit — a common "lazy" entry.
  const nonZero = d.filter((n) => n !== 0).length;
  if (nonZero === 1) return "MOSTLY_ZERO";

  return null;
}

export const PATTERN_LABELS: Record<string, string> = {
  REPDIGIT: "All matching digits",
  PALINDROME: "Palindrome",
  ASCENDING: "Ascending sequence",
  DESCENDING: "Descending sequence",
  REPEATING_BLOCK: "Repeating block",
  MOSTLY_ZERO: "Mostly zeros",
};
