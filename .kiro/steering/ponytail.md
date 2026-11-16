---
inclusion: always
---

# Ponytail — Lean Code Standards

This project uses Ponytail coding principles. Every code change must follow these rules:

## Core Principle
Write only what the task needs. The best code is the code you never wrote.

## Rules (always enforced)
- **Read before writing**: Read all code the change touches and trace the real control flow before picking an approach.
- **Reuse first**: Before creating a new component, function, or module, check whether an existing one already solves the problem.
- **Minimum viable change**: Implement only what the current task requires. No speculative abstractions, no future-proofing, no extra options.
- **Never cut safety**: Validation, error handling, security checks, and accessibility are never on the chopping block regardless of line count.
- **Leave a test**: Any logic with a branch, a loop, a parser, money, or security leaves one small focused test behind.
- **End every reply**: State what was skipped, not checked, and any risk the human should know about.

## What gets cut
- Unused variables, parameters, imports
- Comments that restate what the code already says
- Abstractions that only have one caller
- Wrapper functions that add no logic
- Default prop values that match the component's existing defaults

## What never gets cut
- Input validation and sanitisation
- Error boundaries and fallback states
- Authentication and authorisation checks
- Accessibility attributes (aria-*, role, alt, label)
- Security-sensitive paths (RLS enforcement, API key handling)

Source: https://github.com/DietrichGebert/ponytail
