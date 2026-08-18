/**
 * Renders a structured grammar breakdown from the AI extraction.
 * Receives the raw string value from `VocabularyItem.grammarBreakdown`
 * which may be JSON-encoded (from `grammar_breakdown` TEXT column) or
 * already an object.
 */
'use client';

import type { GrammarBreakdown } from 'shared/schemas';

interface GrammarBreakdownDisplayProps {
  breakdown: string | GrammarBreakdown | undefined | null;
}

export default function GrammarBreakdownDisplay({ breakdown }: GrammarBreakdownDisplayProps) {
  if (!breakdown) return null;

  // Parse if it's a JSON string.
  let parsed: GrammarBreakdown | null = null;
  if (typeof breakdown === 'string') {
    try {
      const candidate = JSON.parse(breakdown);
      if (
        candidate !== null &&
        typeof candidate === 'object' &&
        !Array.isArray(candidate) &&
        typeof (candidate as Record<string, unknown>)['structure'] === 'string' &&
        typeof (candidate as Record<string, unknown>)['explanation'] === 'string'
      ) {
        parsed = candidate as GrammarBreakdown;
      }
    } catch {
      // Not valid JSON — fall through to plain-text rendering.
    }
  } else if (
    breakdown !== null &&
    typeof breakdown === 'object' &&
    !Array.isArray(breakdown) &&
    typeof (breakdown as Record<string, unknown>)['structure'] === 'string' &&
    typeof (breakdown as Record<string, unknown>)['explanation'] === 'string'
  ) {
    parsed = breakdown as GrammarBreakdown;
  }

  // Render as plain text if parsing failed.
  if (!parsed) {
    const text = typeof breakdown === 'string' ? breakdown : String(breakdown);
    return (
      <div className="mt-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left w-full">
        <p className="text-indigo-200 text-sm">{text}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono-data text-indigo-300 font-bold text-base">
          {parsed.structure}
        </span>
        {parsed.cefrLevel && (
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 font-mono-data">
            {parsed.cefrLevel}
          </span>
        )}
      </div>
      {parsed.explanation && (
        <p className="text-indigo-200 text-sm italic">{parsed.explanation}</p>
      )}
      {parsed.partsOfSpeech && parsed.partsOfSpeech.length > 0 && (
        <div className="mt-2 space-y-1">
          {parsed.partsOfSpeech.map((part, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-mono-data font-bold text-indigo-300 min-w-[60px]">{part.word}</span>
              <span className="text-indigo-400/70">({part.pos})</span>
              {part.meaning && (
                <span className="text-indigo-200/60">→ {part.meaning}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
