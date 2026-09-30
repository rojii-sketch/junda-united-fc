# Junda United FC Standings Ranking Rule

## Decision Metadata

- Decision ID: JUNDA-STANDINGS-RANK-001
- Status: APPROVED — PROJECT OWNER
- Date: 2026-09-30
- Decision Owner: Project Owner
- Scope: Active multi-standings system (`/api/standings-tables`; public Match Centre standings; admin standings editing workflow)

## 1. Decision

The Project Owner has approved automatic derived ranking for Junda United FC standings using the sporting criteria in §2, standard competition position numbering (§5), a compatibility-only `rank` field (§6), validation without silent recalculation (§7), exclusion of head-to-head from the initial implementation (§8), and all caveats and gates recorded below.

> Junda United FC standings will be ranked automatically using the following sporting criteria in strict order:
>
> `PTS DESC → GD DESC → GF DESC`
>
> where `GD = GF − GA`.
>
> Higher values rank above lower values.

Team name, alphabetical order, database ID, and array order are not sporting criteria.

## 2. Ranking Algorithm

Teams are ordered by these sporting criteria in strict sequence:

1. Points (`pts`) — descending. Higher points rank above lower points.
2. Goal difference — descending. Applies when points are equal; higher goal difference ranks above lower goal difference.
3. Goals scored (`gf`) — descending. Applies when points and goal difference are both equal; higher goals scored ranks above lower goals scored.

No additional sporting criterion is applied under this decision. In particular, team name, alphabetical order, database ID, and stored array order must never be described or treated as sporting tie-breakers.

## 3. Goal Difference

Goal difference is defined as:

`GD = GF − GA`

- `GD` is derived per team at ranking time from the entered `gf` and `ga` values.
- `GD` is not a separately entered or stored field under the current data model.
- When points are equal, the team with the higher derived `GD` ranks above the team with the lower derived `GD`.

## 4. Tie Handling

If PTS, GD, and GF are all equal:

- the teams are sportingly tied;
- no additional sporting criterion is invented by the application;
- the UI may use a deterministic technical ordering solely to keep rendering stable (for example, a stable sort with a fixed internal key applied after the sporting criteria);
- that technical ordering has no sporting meaning and must not be presented, styled, or narrated as a league-position advantage (including any claim that alphabetical or ID order determines position).

A later authoritative competition regulation may introduce a different tie-break. Such a change requires a formal amendment of this decision before implementation is changed.

## 5. Position Numbering

The approved display convention is standard competition ranking:

```text
1
2
2
4
```

Example:

```text
Team A   25 pts   Pos 1
Team B   21 pts   Pos 2
Team C   21 pts   Pos 2
Team D   18 pts   Pos 4
```

If teams are sportingly tied for a position, they share the same displayed position number and the next position number is skipped accordingly. Dense ranking (`1, 2, 2, 3`) is explicitly not used for this project.

## 6. Rank Field Policy

- The stored `rank` field is no longer authoritative for sporting position.
- Sporting position is derived from the ranking algorithm (§2) applied to standings data.
- Administrators should not manually determine sporting position via a `rank` value.
- The existing database `rank` field remains temporarily for backward compatibility, migration safety, and existing records.
- Deletion of the `rank` field is NOT authorized by this decision.
- Any migration or backfill of stored `rank` values requires separate implementation planning. No model change is made by this decision.

## 7. Statistics Consistency

The following remain administrator-entered values initially:

- P
- W
- D
- L
- GF
- GA
- PTS
- Form

The system should eventually detect:

`P != W + D + L`

and:

`PTS != (W × 3) + D`

but must not silently overwrite administrator-entered values. Whether a detected inconsistency warns-and-allows or blocks saving is deferred to implementation planning. This validation/data-integrity behavior is separate from the ranking algorithm in §2.

## 8. Head-to-Head Scope

> Head-to-head is excluded from the initial ranking implementation.

Reason: the current application does not possess a complete league-wide fixture/result dataset required for reliable head-to-head calculation across all teams.

Do not implement head-to-head as part of this decision. A future head-to-head proposal would need, at minimum, complete league-wide fixtures/results, home/away tracking, competition and season grouping, tied-subset calculation rules, and an explicit competition rule defining when head-to-head applies.

## 9. Other Tie-Breakers

The following remain out of scope unless an authoritative competition regulation is later verified and this decision is formally amended:

- fair play / fair-play points;
- disciplinary records;
- playoffs;
- drawing of lots;
- random selection;
- other competition-specific tie-breakers.

No rule is invented for them in this decision.

## 10. Official Competition Rule Caveat

> This is an application-level Junda United FC project decision. It is not an assertion of the official FKF Mombasa County League regulations.

If official governing competition regulations are later obtained and conflict with this decision, the project decision must be formally amended before implementation is changed. This rule must not be represented as an official FKF regulation.

## 11. Data Model Implications

- No new sporting fields are required for the initial rule: `pts`, `gf`, and `ga` already exist per team; `GD` is derived as `GF − GA`.
- The stored `rank` field is retained temporarily for compatibility and treated as non-authoritative (§6).
- `P/W/D/L/PTS/Form` remain entered statistics subject to future validation (§7), not automatic calculation.
- Head-to-head, fair-play, or playoff support would require data-model changes and is excluded from this decision.

## 12. Admin UI Implications

To be defined during implementation planning (no behavior is changed by this document):

- Administrators edit P, W, D, L, GF, GA, PTS, and Form; sporting position is not set through a manual `rank` input.
- `P != W + D + L` and `PTS != (W × 3) + D` surface through validation handling without silent overwrite.
- Transitional handling of any legacy `rank` input (non-authoritative display, removal, or migration) is deferred to implementation planning.

## 13. Public UI Implications

To be defined during implementation planning (no behavior is changed by this document):

- The public table order follows the derived ranking (§2), not stored array order.
- The `Pos` column displays the derived position per §5, not the stored `rank` value.
- Fully tied teams share the displayed position; internal row order between them carries no sporting meaning.

## 14. API / Backend Implications

To be defined during implementation planning (no behavior is changed by this document):

- Ordering must be derived from `pts`/`gf`/`ga` rather than trusting stored `rank` or array position.
- Read-time versus write-time derivation, persisted-order handling, cache behavior, and API contract considerations are deferred to implementation planning.

## 15. Compatibility and Migration

- The existing `rank` field stays in the short term for compatibility with existing records, API payloads, and rollback safety.
- From approval onward it is non-authoritative for sporting position.
- Backfill or migration of stored values, and any eventual removal of the field, require separate planning and authorization. This decision authorizes documentation only.

## 16. Acceptance Criteria

### Ranking

- Given teams with different points: higher points rank above lower points.
- Given equal points: higher GD ranks above lower GD.
- Given equal points and GD: higher GF ranks above lower GF.
- Given equal PTS, GD, and GF: teams remain sportingly tied unless an authoritative competition rule is later adopted; technical stable ordering carries no sporting meaning.

### Position display

- Positions display as standard competition ranking `1, 2, 2, 4`; dense `1, 2, 2, 3` is not used.

### Editing

- Changing a team's PTS/GD/GF inputs eventually changes the derived ordering automatically.
- Changing a manually entered `rank` value is NOT the mechanism that determines sporting order.

### Integrity

- The system identifies `P != W + D + L` and `PTS != 3W + D` without silently changing administrator-entered statistics.

### Scope guards

- Team name, database ID, and array order are never sporting criteria.
- Head-to-head, fair play, playoffs, lots, and other unverified tie-breakers remain unimplemented.
- The rule is never represented as official FKF policy.

## 17. Implementation Gate

> This decision authorizes implementation planning but does not itself authorize implementation.

The next phase must separately define: backend sorting strategy, frontend sorting behavior, derived position calculation, admin UI changes, validation behavior, compatibility handling for `rank`, migration requirements, cache behavior, tests, API contract considerations, and regression testing. No code, data, or API behavior was changed by recording this decision.

## 18. Approval Record

| Decision Item                              | Status   |
| ------------------------------------------ | -------- |
| PTS → GD → GF                              | APPROVED |
| Standard ranking 1,2,2,4                   | APPROVED |
| Derived sporting position                  | APPROVED |
| Existing rank retained temporarily         | APPROVED |
| H2H excluded initially                     | APPROVED |
| Validation without silent recalculation    | APPROVED |
| Other unverified tie-breakers out of scope | APPROVED |
| Official-rule caveat                       | APPROVED |

```text
Approval:
Project Owner — APPROVED
Date: 2026-09-30
```
