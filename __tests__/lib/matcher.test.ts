import { describe, it, expect } from 'vitest';
import { matchPlayers } from '@/lib/matcher';
import { SleeperPlayer, ParsedPlayer } from '@/lib/types';

const mockPlayers: SleeperPlayer[] = [
  { player_id: '1', full_name: 'Patrick Queen', first_name: 'Patrick', last_name: 'Queen', position: 'LB', team: 'BAL', active: true },
  { player_id: '2', full_name: 'Roquan Smith', first_name: 'Roquan', last_name: 'Smith', position: 'LB', team: 'BAL', active: true },
  { player_id: '3', full_name: 'Myles Garrett', first_name: 'Myles', last_name: 'Garrett', position: 'DE', team: 'CLE', active: true },
  { player_id: '4', full_name: 'Jordan Smith', first_name: 'Jordan', last_name: 'Smith', position: 'DE', team: 'JAX', active: true },
  { player_id: '5', full_name: 'Jordan Smith', first_name: 'Jordan', last_name: 'Smith', position: 'LB', team: 'ATL', active: true },
];

describe('matchPlayers', () => {
  it('matches exact names', () => {
    const input: ParsedPlayer[] = [{ name: 'Patrick Queen', rank: 1 }];
    const { matched, unmatched } = matchPlayers(input, mockPlayers);
    expect(matched).toHaveLength(1);
    expect(matched[0].matchedPlayer?.id).toBe('1');
    expect(unmatched).toHaveLength(0);
  });

  it('matches fuzzy names', () => {
    const input: ParsedPlayer[] = [{ name: 'Pat Queen', rank: 1 }];
    const { matched, unmatched } = matchPlayers(input, mockPlayers);
    expect(matched).toHaveLength(1);
    expect(matched[0].matchedPlayer?.name).toBe('Patrick Queen');
  });

  it('uses position as tiebreaker for ambiguous names', () => {
    const input: ParsedPlayer[] = [{ name: 'Jordan Smith', position: 'DE', rank: 1 }];
    const { matched } = matchPlayers(input, mockPlayers);
    expect(matched[0].matchedPlayer?.id).toBe('4');
  });

  it('uses team as tiebreaker for ambiguous names', () => {
    const input: ParsedPlayer[] = [{ name: 'Jordan Smith', team: 'ATL', rank: 1 }];
    const { matched } = matchPlayers(input, mockPlayers);
    expect(matched[0].matchedPlayer?.id).toBe('5');
  });

  it('reports unmatched players above threshold', () => {
    const input: ParsedPlayer[] = [{ name: 'XYZNONEXISTENT', rank: 1 }];
    const { matched, unmatched } = matchPlayers(input, mockPlayers);
    expect(matched).toHaveLength(0);
    expect(unmatched).toEqual(['XYZNONEXISTENT']);
  });

  it('handles multiple players', () => {
    const input: ParsedPlayer[] = [
      { name: 'Patrick Queen', rank: 1 },
      { name: 'Myles Garrett', rank: 2 },
    ];
    const { matched } = matchPlayers(input, mockPlayers);
    expect(matched).toHaveLength(2);
  });
});
