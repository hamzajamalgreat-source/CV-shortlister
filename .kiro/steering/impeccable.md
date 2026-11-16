---
inclusion: always
---

# Impeccable — Design Vocabulary

This project uses Impeccable design standards. All UI work must follow these principles.

## Core Commands (use these when reviewing or improving UI)
- **critique**: Score the UI against usability heuristics and rank what to fix first
- **audit**: Technical quality report (accessibility, performance, theming, responsive)
- **polish**: Final pass before shipping — spacing, typography, color consistency
- **bolder**: Amplify a safe/timid design
- **quieter**: Tone down a loud design
- **harden**: Cover errors, i18n, overflow, and edge cases

## Design Rules for this project
- No "Inter for everything + purple-to-blue gradient" defaults — design decisions must be intentional
- Cards must have clear visual hierarchy — not cards nested in cards
- Gray text on colored backgrounds is forbidden (contrast)
- Every rounded-square icon tile above a heading must have a purposeful reason
- Padding must be generous and consistent — use Tailwind spacing scale systematically
- Color palette: professional blues and neutrals; accent sparingly
- Typography: clear hierarchy (heading > subheading > body > caption)
- Buttons: clear affordance, distinct hierarchy (primary > secondary > ghost)

## Context files
- Run `/impeccable init` once to generate `PRODUCT.md`
- Run `/impeccable document` to generate `DESIGN.md` capturing the visual system

Source: https://github.com/pbakaus/impeccable
