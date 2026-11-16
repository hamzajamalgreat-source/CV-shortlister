# CV Screening — Agent Rules (Ponytail)

## Read before writing
Read every file the change touches. Trace the real control flow. Never assume.

## Reuse first
Check `src/components/`, `src/hooks/`, `src/lib/` for anything that already solves the problem before creating new files.

## Minimum viable change
Implement only what the current task requires. No extra abstractions, no future options, no speculative code.

## Never cut
- Input validation and Zod schema checks
- Supabase RLS enforcement (never bypass with service role in client code)
- Error boundaries and retry logic
- ARIA attributes, focus management, color contrast
- API key protection (Grok key stays server-side only)

## Always leave
- One focused test for any branching logic, parsing, or security path
- A comment on any deliberate shortcut: `// shortcut: <reason> — revisit <when>`

## Tech constraints
- React + TypeScript + Tailwind — no new UI libraries without explicit approval
- Supabase JS v2 only — no direct `fetch` to Supabase REST
- Zod v3 schemas — validate all external data before use
- All Grok API calls in `api/` (server only) — never in `src/`
