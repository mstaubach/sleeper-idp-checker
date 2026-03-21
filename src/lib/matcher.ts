import Fuse from 'fuse.js';
import { SleeperPlayer, ParsedPlayer, PlayerResult, POSITION_GROUPS } from './types';

const MATCH_THRESHOLD = 0.4;

interface MatchResult {
  matched: PlayerResult[];
  unmatched: string[];
}

export function matchPlayers(
  input: ParsedPlayer[],
  sleeperPlayers: SleeperPlayer[]
): MatchResult {
  const fuse = new Fuse(sleeperPlayers, {
    keys: [
      { name: 'full_name', weight: 3 },
      { name: 'last_name', weight: 1 },
      { name: 'first_name', weight: 0.5 },
    ],
    threshold: MATCH_THRESHOLD,
    includeScore: true,
  });

  const matched: PlayerResult[] = [];
  const unmatched: string[] = [];

  for (const player of input) {
    const results = fuse.search(player.name);

    if (results.length === 0) {
      unmatched.push(player.name);
      continue;
    }

    // Among close matches, prefer active players (those with a team) over free agents
    // This prevents "TJ Watt" matching retired "J.J. Watt" instead of active "T.J. Watt"
    let best = results[0];

    // First: if scores are close, prefer players on active NFL rosters
    const CLOSE_SCORE_THRESHOLD = 0.15;
    const activeResults = results.filter(r => r.item.team != null);
    if (activeResults.length > 0 && best.item.team == null) {
      const bestActiveScore = activeResults[0].score ?? 1;
      const bestScore = best.score ?? 1;
      if (bestActiveScore - bestScore < CLOSE_SCORE_THRESHOLD) {
        best = activeResults[0];
      }
    }

    // Then: apply position/team tiebreakers if provided
    if (player.position || player.team) {
      const filtered = results.filter((r) => {
        const p = r.item;
        if (player.position && p.position) {
          // Check direct match or same position group
          const inputGroup = Object.entries(POSITION_GROUPS).find(([, positions]) =>
            positions.includes(player.position!)
          )?.[0];
          const playerGroup = Object.entries(POSITION_GROUPS).find(([, positions]) =>
            positions.includes(p.position!)
          )?.[0];
          if (inputGroup && playerGroup && inputGroup !== playerGroup) return false;
          if (!inputGroup && player.position !== p.position) return false;
        }
        if (player.team && p.team && player.team.toUpperCase() !== p.team.toUpperCase()) {
          return false;
        }
        return true;
      });
      if (filtered.length > 0) {
        best = filtered[0];
      }
    }

    matched.push({
      inputName: player.name,
      matchedPlayer: {
        id: best.item.player_id,
        name: best.item.full_name,
        position: best.item.position || 'Unknown',
        team: best.item.team || 'FA',
      },
      matchConfidence: 1 - (best.score ?? 0),
      rank: player.rank,
      tier: player.tier,
      available: true, // Will be set by availability check
      rosteredBy: null,
    });
  }

  return { matched, unmatched };
}
