# Copilot metrics ingestion

This note explains how the dashboard turns raw GitHub Copilot data into
the per-day, per-team series that drives the charts. The implementation
lives in [`src/dashboard/services/copilot-metrics-service.ts`](../src/dashboard/services/copilot-metrics-service.ts).

## Data sources

The service has three back-ends and picks the first one that is
configured for the current request:

| Back-end | When | Notes |
| --- | --- | --- |
| **CosmosDB** | `AZURE_COSMOSDB_ENDPOINT` is set | Reads pre-ingested daily snapshots written by the Azure Function. Best for production where we don't want to hit GitHub on every page load. |
| **GitHub API (live)** | No CosmosDB endpoint, but `GITHUB_TOKEN` is set | Pulls fresh data from GitHub on every request. Used for local development and small deployments. |
| **Sample data** | Neither of the above | Lets contributors run the UI without any credentials. |

This document focuses on the **GitHub API (live)** path because that's
where the recent changes were made.

## The live path, step by step

```
                +-----------------------------------------+
                |  GET /copilot/metrics/reports/          |
                |  users-28-day/latest                    |
                |  -> { download_links: [url1, url2,...] }|
                +-----------------------------------------+
                                  |
                                  v
                  for each download_link:
                +-----------------------------------------+
                |  GET <download_link>                    |
                |  -> JSON array OR NDJSON of             |
                |     UsageMetricsUserDayRecord rows      |
                +-----------------------------------------+
                                  |
                                  v
                +-----------------------------------------+
                |  GET /copilot/billing/seats?per_page=100|
                |  -> SeatAssignment[]                    |
                |  (paginated; follow Link: rel="next")   |
                +-----------------------------------------+
                                  |
                                  v
                +-----------------------------------------+
                |  Build a `userLogin -> teams[]` lookup  |
                |  from the seat assignments.             |
                +-----------------------------------------+
                                  |
                                  v
                +-----------------------------------------+
                |  For each usage record:                 |
                |   - filter by selected date range       |
                |   - filter by selected teams (if any)   |
                |   - bucket the totals by                |
                |     (day, language, IDE, feature)       |
                |  Then merge into CopilotUsageOutput[]   |
                +-----------------------------------------+
```

## Why we switched from the per-day metrics endpoint

The previous per-day endpoint (`/orgs/{org}/copilot/metrics`) returns
already-aggregated counters by day, IDE and language. It does **not**
include per-user information, which means we cannot:

- Distinguish licensed-but-inactive users from engaged users.
- Group activity by team without making one extra API call per team.
- Cleanly separate chat usage from completion usage.

The user-day usage report exposes the underlying per-user, per-day rows
(`UsageMetricsUserDayRecord`), so all three become local computations.
The trade-off is that we have to download and aggregate the report
ourselves, which is what most of the new code in
`copilot-metrics-service.ts` is doing.

## Field reference (UsageMetricsUserDayRecord)

The shape we consume from GitHub. Every numeric field is optional and
treated as `0` when missing.

| Field | Meaning |
| --- | --- |
| `day` | ISO date (`YYYY-MM-DD`) the activity is attributed to. |
| `user_login` | GitHub login of the user. |
| `used_chat`, `used_agent`, `used_cli`, ... | Booleans flagging which surfaces the user touched that day. |
| `code_generation_activity_count` | Times the user triggered a completion suggestion. |
| `code_acceptance_activity_count` | Times the user accepted one. |
| `loc_suggested_to_add_sum`, `loc_suggested_to_delete_sum` | Lines suggested. |
| `loc_added_sum`, `loc_deleted_sum` | Lines actually accepted. |
| `user_initiated_interaction_count` | Catch-all for chat / agent prompts. |
| `totals_by_ide` | Same totals broken down by IDE. |
| `totals_by_feature` | Same totals broken down by Copilot feature. |
| `totals_by_language_feature` | Three-way breakdown by language and feature. |

A user is considered **engaged** on a day if any of the activity
counters above is greater than 0. Anything else (i.e. the seat exists
but no surface was touched) is "licensed-but-inactive".

## Environment variables

The metrics service relies on `services/env-service.ts` to validate the
following:

| Variable | Required when | Notes |
| --- | --- | --- |
| `GITHUB_API_SCOPE` | always (defaults to `organization`) | Either `organization` or `enterprise`. |
| `GITHUB_ORGANIZATION` | scope is `organization` | The org slug. Ignored for enterprise scope. |
| `GITHUB_ENTERPRISE`   | scope is `enterprise`   | The enterprise slug. Ignored for organization scope. |
| `GITHUB_TOKEN` | always | PAT or fine-grained token with Copilot read access. |
| `GITHUB_API_VERSION` | always | Currently `2022-11-28`. |

Previously the service required **all** of these regardless of scope,
which forced org users to set a dummy `GITHUB_ENTERPRISE`. That has been
relaxed.

## TypeScript target

The aggregation helpers iterate over `Set` values, which TypeScript
refuses to compile under the default `target: "es5"`. `tsconfig.json`
sets `target: "es2015"` to allow native iteration. All Node versions the
dashboard supports run ES2015 natively, so this is purely a compile-time
flag.
