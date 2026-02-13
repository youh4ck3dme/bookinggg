# Go-Live Signoff Prompt

Použi tento prompt na finálne release rozhodnutie po prebehnutí CI gate a release checklistu.

## Prompt (copy/paste)

```text
ACT AS: Principal Release Manager + Staff SRE.

CONTEXT:
- Projekt: BookingGG (Next.js PWA + Nest API + Supabase)
- Branch/Commit: <dopln branch a commit SHA>
- Release window: <dopln dátum/čas a timezone>
- Environment: <staging|production>

MANDATORY INPUTS:
1) Posledný CI run (lint/test/build/e2e) + URL
2) Výstup z RELEASE_CHECKLIST.md (všetky checkboxy)
3) Výsledok supabase/rls_audit.sql (pass/fail + log)
4) Sentry health snapshot (error rate, top issues, alert status)
5) Rollback plán (image/tag, DB rollback postup, owner)
6) Known risks + mitigácie

TASK:
- Vykonaj GO/NO-GO rozhodnutie s jednoznačným verdictom.
- Ak GO: vygeneruj presný rollout plán po krokoch (T-30, T-10, T0, T+15, T+60), vrátane owners.
- Ak NO-GO: presne vypíš blokery, priority (P0/P1), ownerov a ETA na re-check.
- Over:
  - CI gate je zelený (lint/test/build/e2e)
  - RLS audit je PASS
  - Sentry je aktívny pre web aj api
  - Structured logs sa zapisujú (http_request, api_started, bootstrap_failed)
  - Env secrets sú nastavené
- Daj finálny output v štruktúre:
  1) Executive Summary
  2) Evidence Table
  3) Risk Register
  4) Decision (GO/NO-GO)
  5) Command Plan
  6) Rollback Plan
  7) Post-Release Verification

OUTPUT FORMAT:
- Buď striktne konkrétny, bez vágnych formulácií.
- Pri každom tvrdení uveď dôkaz (log, URL, screenshot, commit).
- Na konci pridaj jednu vetu:
  - "FINAL VERDICT: GO" alebo
  - "FINAL VERDICT: NO-GO"
```

## Recommended usage

1. Uisti sa, že `.github/workflows/ci.yml` je green.
2. Prejdi `RELEASE_CHECKLIST.md` a doplň dôkazy.
3. Spusť prompt vyššie s aktuálnymi dátami.
4. Verdikt archivuj do release ticketu (Jira/Linear/GitHub Release).

## Fast signoff command bundle

```bash
pnpm -r lint && \
pnpm -r test && \
pnpm -r build && \
pnpm -C apps/web test:e2e
```

Ak e2e lokálne zlyhá kvôli systémovým knižniciam, ber ako zdroj pravdy CI run s Playwright `--with-deps` krokom.
