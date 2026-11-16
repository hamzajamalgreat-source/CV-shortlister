---
inclusion: always
---

# OmniRoute — AI Traffic Routing

This project is configured to route AI agent traffic through OmniRoute, a unified routing engine that supports model mappings, circuit breakers, fallbacks, and cost tracking.

## Setup
OmniRoute runs as a local service on port 20128. To use it:

1. Install OmniRoute: https://github.com/diegosouzapw/OmniRoute
2. Start the OmniRoute server: follow the project README
3. The Kiro MCP config at `.kiro/settings/mcp.json` connects Kiro to OmniRoute automatically

## What OmniRoute provides
- **Model routing**: Redirect AI calls to different providers (Grok, Claude, Gemini, etc.)
- **Fallback chains**: If one provider fails, automatically route to the next
- **Cost tracking**: Monitor per-session token usage and cost
- **Traffic Inspector**: Real-time view of all intercepted AI requests

## For this project
The Grok API calls in `src/lib/grokClient.ts` can optionally be routed through OmniRoute for resilience and observability. Set `OMNIROUTE_BASE_URL` in your `.env.local` if you want API calls proxied.
