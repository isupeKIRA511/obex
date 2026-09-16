import { Target, SessionSummary } from '../types';

/**
 * Normalizes astronomical target string for fuzzy matching
 * e.g. "HAT-P-10", "HATP-10", "hatp 10" -> "hatp10"
 * e.g. "TrES-5", "TRES-5", "tres 5" -> "tres5"
 */
export function normalizeTarget(name?: string | null): string {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if two target identifiers refer to the same astronomical system
 */
export function isSameTarget(name1?: string | null, name2?: string | null): boolean {
  if (!name1 || !name2) return false;
  return normalizeTarget(name1) === normalizeTarget(name2);
}

/**
 * Robustly finds the most suitable session for a given target
 */
export function findSessionForTarget(
  sessions: SessionSummary[],
  targetName?: string | null
): SessionSummary | undefined {
  if (!sessions || sessions.length === 0) return undefined;
  if (!targetName) return sessions[0];

  const normalized = normalizeTarget(targetName);

  // 1. Try exact normalized match with good quality first
  const goodMatch = sessions.find(
    (s) => normalizeTarget(s.target) === normalized && s.quality === 'good'
  );
  if (goodMatch) return goodMatch;

  // 2. Try any normalized match
  const anyMatch = sessions.find((s) => normalizeTarget(s.target) === normalized);
  if (anyMatch) return anyMatch;

  // 3. Fallback to first available session
  return sessions[0];
}

/**
 * Safe number formatting with fallback to prevent undefined.toFixed crashes
 */
export function safeFixed(
  val: number | string | null | undefined,
  digits: number = 2,
  fallback: string = '—'
): string {
  if (val === null || val === undefined) return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num.toFixed(digits);
}
