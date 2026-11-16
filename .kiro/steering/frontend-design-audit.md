---
inclusion: always
---

# Frontend Design Audit — 15 Usability Principles

This project applies Frontend Design Audit standards to all UI components. Every page and component must be evaluated against these 15 principles before shipping.

## The 15 Principles

| # | Principle | What to check |
|---|-----------|---------------|
| 1 | Visibility of System Status | Loading states, action feedback, progress indicators |
| 2 | Match Between System and Real World | No jargon, intuitive labels, correct mental models |
| 3 | User Control and Freedom | Undo, escape, back navigation |
| 4 | Consistency and Standards | Same patterns across all pages |
| 5 | Error Prevention | Validation before submission, confirmation for destructive actions |
| 6 | Recognition Over Recall | Empty states, breadcrumbs, visible options |
| 7 | Flexibility and Efficiency | Keyboard navigation, power-user paths |
| 8 | Aesthetic and Minimalist Design | Clean typography, good spacing, no clutter |
| 9 | Error Recovery | Helpful error messages with recovery guidance |
| 10 | Help and Documentation | Onboarding, contextual help |
| 11 | Affordances and Signifiers | Clear clickability, button hierarchy |
| 12 | Structure | Good grouping, clear section boundaries |
| 13 | Accessibility | alt text, focus indicators, color contrast ≥ 4.5:1 |
| 14 | Perceptibility | Visible state changes, sufficient contrast |
| 15 | Tolerance and Forgiveness | No data loss on error, flexible inputs |

## Severity Scale
- **0 — Catastrophe**: Blocks task completion
- **1 — Critical**: Major disruption to user flow
- **2 — Major**: Noticeable friction
- **3 — Minor**: Small improvement opportunity
- **4 — Cosmetic**: Polish item

## Checklist for every new component
- [ ] Loading and empty states implemented
- [ ] All interactive elements have keyboard focus styles
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Error messages are descriptive and actionable
- [ ] Form fields have visible labels (not just placeholder text)
- [ ] Buttons have clear disabled states when actions are unavailable

Source: https://github.com/mistyhx/frontend-design-audit
