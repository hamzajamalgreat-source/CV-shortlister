/**
 * SERVER-SIDE ONLY — import only from api/ (Vercel Functions).
 * Never import from src/ client bundle. GROK_API_KEY must not reach the browser.
 */
/// <reference types="node" />

const GROK_API_KEY = process.env.GROK_API_KEY;
const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL;
// If OmniRoute is running, route through it; otherwise call Grok directly
const GROK_API_URL = OMNIROUTE_BASE_URL
  ? `${OMNIROUTE_BASE_URL}/v1/chat/completions`
  : 'https://api.x.ai/v1/chat/completions';

const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 5_000;

const SYSTEM_PROMPT = `You are a CV parser. Extract information into JSON matching exactly this schema:
{
  "name": "string",
  "skills": ["string"],
  "experience": [{"employer":"string","title":"string","years":0,"description":"string"}],
  "education": [{"institution":"string","degree":"string","field":"string"}],
  "projects": [{"name":"string","technologies":["string"],"description":"string"}]
}
Return ONLY the JSON object. No markdown, no commentary.`;

async function callGrokOnce(cvText: string, signal: AbortSignal): Promise<unknown> {
  if (!GROK_API_KEY) throw new Error('GROK_API_KEY env var is not set.');

  const res = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    signal,
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: cvText },
      ],
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error(`Grok API ${res.status}: ${res.statusText}`);

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Grok API returned empty content.');
  return JSON.parse(content) as unknown;
}

export async function extractProfile(cvText: string): Promise<unknown> {
  // Attempt 1
  const ctrl1 = new AbortController();
  const t1 = setTimeout(() => ctrl1.abort(), TIMEOUT_MS);
  try {
    const result = await callGrokOnce(cvText, ctrl1.signal);
    clearTimeout(t1);
    return result;
  } catch {
    clearTimeout(t1);
  }

  // Wait then retry once
  await new Promise(r => setTimeout(r, RETRY_DELAY_MS));

  const ctrl2 = new AbortController();
  const t2 = setTimeout(() => ctrl2.abort(), TIMEOUT_MS);
  try {
    const result = await callGrokOnce(cvText, ctrl2.signal);
    clearTimeout(t2);
    return result;
  } finally {
    clearTimeout(t2);
  }
}
