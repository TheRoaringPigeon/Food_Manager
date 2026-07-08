# Cypress Test Fix Loop

Run all Cypress e2e tests, fix every failure, and repeat until the full suite is green.

## Process

### 1. Ensure the dev server is running

Cypress requires the frontend to be live at `http://localhost:5173` (or the port in `cypress.config.ts`). Check first — start only if needed:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null
```

If that returns anything other than `200`, start the server in the background from `fm_frontend/`:

```bash
cd fm_frontend && npm run dev
```

Run with `run_in_background: true`. Then poll until the port is up before continuing (use `curl --retry 10 --retry-delay 1 --retry-connrefused -s http://localhost:5173`).

### 2. Run Cypress

From `fm_frontend/`:

```bash
cd fm_frontend && npm run cy:run 2>&1
```

Capture the full output. The key lines to watch for:
- `X passing` — tests that succeeded
- `X failing` — tests that failed
- Individual failure blocks that show:
  - The test title (e.g. `Recipes page > opens recipe detail modal on row click`)
  - The assertion error (e.g. `AssertionError: Timed out retrying after 4000ms: Expected to find element: 'div.fixed'`)
  - The line number in the test file

Exit code 0 = all passing. Exit code 1 = failures (or crash). Exit code 2+ = Cypress could not start.

### 3. Analyze failures

For each failing test, determine the root cause before changing anything:

**Test file bug** — the test makes a wrong assumption:
- Wrong selector (element doesn't exist / has a different class/attribute)
- Wrong text content checked (case, punctuation, whitespace)
- Missing or misordered `cy.wait()` for an aliased request
- Wrong API path in `cy.intercept()`
- Assertion that contradicts how the component actually works

**Source code bug** — the app doesn't behave as the test expects:
- Component renders the wrong text or uses wrong class names
- Feature logic is broken
- API response shape mismatch

Read the relevant source files before deciding which side is wrong. If the component clearly does X and the test expects Y, and Y is the right behavior, fix the source. If Y is just the test being wrong, fix the test.

### 4. Fix the failures

Edit the correct files. Minimal, targeted changes only — don't refactor surrounding code.

Common fixes needed for this project:

- **Selector mismatches**: read the actual component JSX to find the real element, class, or text. Use `cy.contains()` with exact strings where possible rather than brittle CSS selectors.
- **Intercept path wrong**: check `fm_frontend/src/api/` to confirm the exact URL path being fetched. Compare to what the test intercepts via `api('/...')`.
- **Missing intercept for on-mount fetch**: if a component fetches data on mount (check `useEffect` calls), the test's `beforeEach` must stub that endpoint or the component may redirect/error before the test action runs.
- **Timing / wait missing**: if an element appears only after an async operation, add `cy.wait('@alias')` before asserting it.
- **Cart seed timing**: `cy.seedCart()` must be called after `cy.login()` and before `cy.visit()` so the CartContext reads the pre-seeded value.
- **SSE stream test**: the recommendations stream test stubs the LLM endpoint with a static SSE body. If that test is flaky, verify the `Content-Type: text/event-stream` header is set in the intercept and that the body string has `\n\n` between each event.

### 5. Repeat

After fixing, go back to step 2 and run Cypress again. Continue until the output shows:

```
All specs passed!
X passing (Xs)
0 failing
```

Do not stop while any test is still failing. If a test is genuinely untestable as written (e.g. requires a live backend that can't be stubbed), note it explicitly and skip it by adding `.skip` — but exhaust all fix options first.

## Scope

Tests live in `fm_frontend/cypress/e2e/`. Source files are in `fm_frontend/src/`. Do not modify `cypress.config.ts` or `cypress/support/` unless a command or path constant is provably wrong.

## When you're done

Report:
- Total specs run and pass count
- Any tests that were skipped with `.skip` and why
- A brief summary of what was fixed (test bugs vs source bugs)
