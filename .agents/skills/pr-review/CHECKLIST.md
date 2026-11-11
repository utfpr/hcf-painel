# HCF Painel PR review checklist

Read only the sections matching the selected lenses.

## Features and UI

- Preserve existing component and feature conventions; avoid moving API calls
  into presentational components.
- Loading, error, empty, and success states remain distinct and usable.
- Forms preserve validation, masking, disabled/submitting behavior, and server
  error feedback.
- Lists, maps, reports, and tombos keep stable keys and do not silently lose
  records through filtering, pagination, or normalization.
- Interactive controls have accessible names, keyboard behavior, focus states,
  and appropriate semantic elements.
- Do not expose secrets, tokens, personal data, or raw server errors in the UI.

## Data fetching and HTTP

- Feature queries use `useQuery` from `@/hooks/query/useQuery`; do not use
  `useSWR` directly in feature hooks or pages.
- Keep HTTP access in fetchers passed to `useQuery`, close to the feature's
  existing convention. Preserve `data`, `loading`, `error`, and `refresh`.
- Verify request parameters, response normalization, cancellation/revalidation,
  and stale-data behavior. Update fetcher tests for endpoint or shape changes.
- Preserve auth headers, CSRF/session handling, and intentional status mapping.

## Auth, session, and routing

- Protected pages and actions remain protected; logout, expiry, refresh, and
  unauthorized responses do not leave stale privileged state visible.
- Do not put credentials or access tokens in URLs, logs, local storage, or
  committed configuration unless the existing contract explicitly requires it.
- Routes preserve deep links, redirects, query parameters, and back-button
  behavior. New public routes are intentional.

## Herbarium contracts

- Tombo identity, barcode/RFID, remessa, and status transitions are not
  duplicated, reassigned, or silently dropped.
- Scientific-name ranks and Darwin Core/SpeciesLink/Reflora field mappings keep
  the existing order and required fields.
- Coordinate and municipality/polygon displays do not silently invert or round
  valid values.

## Tests and build

- New behavior has focused tests in the matching `test/` feature/library area;
  changed endpoint parameters and normalization have fetcher tests.
- Test files follow the type/module naming convention already present nearby.
- Check the PR's lint, test, build, and security CI jobs. A failing job is a
  blocker unless explicitly waived by the user.
- Workflow and dependency changes do not remove required checks, weaken secret
  handling, or introduce an unnecessary package.

## Findings discipline

- Block only introduced or worsened correctness, security, data-loss,
  accessibility, contract, or CI failures.
- One finding per root cause, with a changed-file path and diff line.
- Do not report formatting preferences, praise, or non-actionable notes.
