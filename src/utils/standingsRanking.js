// src/utils/standingsRanking.js
//
// FRONTEND MIRROR of backend/utils/standingsRanking.js (which is canonical).
// Implements JUNDA-STANDINGS-RANK-001: PTS DESC → GD DESC → GF DESC,
// GD = GF - GA, standard competition numbering (1,2,2,4).
//
// Used ONLY for defensive derivation before rendering: the backend
// remains the canonical ranking source. Any rule change requires a
// decision amendment first, then an update to BOTH copies plus both
// test files in the same commit. Do not specialise this copy.
//
// Stored `rank` is never consulted for ordering.

const toNumberOrDefault = (value, fallback = 0) => {
  const numeric = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : fallback;
};

const isCheckableNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

// Derived goal difference for one team. Missing/invalid values coerce
// to 0 so rendering never crashes on old/cached payloads.
export const goalDifferenceOf = (team = {}) =>
  toNumberOrDefault(team.gf) - toNumberOrDefault(team.ga);

// Sporting key only. Name, _id, array order and stored rank are
// deliberately excluded: they are never sporting criteria.
const sportingKeyOf = (team = {}) => ({
  pts: toNumberOrDefault(team.pts),
  gd: goalDifferenceOf(team),
  gf: toNumberOrDefault(team.gf),
});

// Deterministic technical stability key, used ONLY after complete
// sporting equality (PTS+GD+GF). It carries no sporting meaning and
// must never be presented as a tie-break.
const stabilityKeyOf = (team = {}, index = 0) => {
  const id = team && team._id !== undefined && team._id !== null ? String(team._id) : '';
  const name = typeof team?.name === 'string' ? team.name.toLowerCase() : '';
  return `${id} ${name} ${index}`;
};

const compareSportingKeys = (a, b) => {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return 0;
};

const sameSportingKey = (a, b) => a.pts === b.pts && a.gd === b.gd && a.gf === b.gf;

// Sort teams into canonical sporting order and assign standard
// competition positions (1,2,2,4). Returns a NEW array of shallow
// copies, each with added `position` and `gd`. Inputs are not mutated.
export const rankTable = (teams = []) => {
  const list = Array.isArray(teams) ? teams : [];
  const decorated = list.map((team, index) => ({
    team,
    index,
    key: sportingKeyOf(team),
    stability: stabilityKeyOf(team, index),
  }));

  decorated.sort((a, b) => compareSportingKeys(a.key, b.key) || (a.stability < b.stability ? -1 : a.stability > b.stability ? 1 : 0));

  let position = 0;
  return decorated.map((entry, sortedIndex) => {
    if (sortedIndex === 0 || !sameSportingKey(entry.key, decorated[sortedIndex - 1].key)) {
      position = sortedIndex + 1;
    }
    const source = entry.team && typeof entry.team === 'object' ? entry.team : {};
    return { ...source, gd: entry.key.gd, position };
  });
};

// Consistency warnings for the effective team record.
// Warning-only: callers must persist the record unchanged and surface
// these messages.
export const buildWarnings = (team = {}) => {
  const warnings = [];
  const { p, w, d, l, pts } = team;

  if ([p, w, d, l].every(isCheckableNumber) && p !== w + d + l) {
    warnings.push(`P (${p}) != W+D+L (${w + d + l})`);
  }
  if ([pts, w, d].every(isCheckableNumber) && pts !== w * 3 + d) {
    warnings.push(`PTS (${pts}) != 3W+D (${w * 3 + d})`);
  }
  return warnings;
};
