import { createRng, shuffle, type Rng } from '../../lib/rng';
import type { Difficulty } from '../catalog';

// 9×9 스도쿠 생성·검증. 칸 번호는 0~80(행 우선), 값 0은 빈칸.
// 난이도는 지금은 남기는 단서 수로만 나눈다. 풀이 기법 기준은 플레이테스트 뒤에 더한다.

export type SudokuGrid = number[];

export type SudokuPuzzle = {
  givens: SudokuGrid;
  solution: SudokuGrid;
};

const CLUES: Record<Difficulty, number> = { easy: 40, normal: 32, hard: 26 };

const ALL_DIGITS = 0b1111111110; // 1~9 비트

export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

function bitCount(mask: number): number {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
}

function digitsOf(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & (1 << d)) out.push(d);
  return out;
}

type SolveResult = { count: number; first: SudokuGrid | null };

// 정답을 limit개까지 센다. rng를 주면 숫자를 섞어서 시도한다(빈 판을 채울 때 사용).
function solve(grid: SudokuGrid, limit: number, rng?: Rng): SolveResult {
  const cells = [...grid];
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);

  for (let i = 0; i < 81; i++) {
    const v = cells[i];
    if (!v) continue;
    const bit = 1 << v;
    const r = rowOf(i);
    const c = colOf(i);
    const b = boxOf(i);
    if ((rows[r] | cols[c] | boxes[b]) & bit) return { count: 0, first: null };
    rows[r] |= bit;
    cols[c] |= bit;
    boxes[b] |= bit;
  }

  let count = 0;
  let first: SudokuGrid | null = null;

  const search = (): boolean => {
    // 후보가 가장 적은 빈칸부터 채운다
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (cells[i]) continue;
      const mask = ALL_DIGITS & ~(rows[rowOf(i)] | cols[colOf(i)] | boxes[boxOf(i)]);
      const n = bitCount(mask);
      if (n === 0) return false;
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best === -1) {
      count++;
      if (!first) first = [...cells];
      return count >= limit;
    }

    const r = rowOf(best);
    const c = colOf(best);
    const b = boxOf(best);
    const digits = rng ? shuffle(digitsOf(bestMask), rng) : digitsOf(bestMask);
    for (const d of digits) {
      const bit = 1 << d;
      cells[best] = d;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      if (search()) return true;
      cells[best] = 0;
      rows[r] &= ~bit;
      cols[c] &= ~bit;
      boxes[b] &= ~bit;
    }
    return false;
  };

  search();
  return { count, first };
}

export function hasUniqueSolution(grid: SudokuGrid): boolean {
  return solve(grid, 2).count === 1;
}

export function generateSudoku(seed: string, difficulty: Difficulty): SudokuPuzzle {
  const rng = createRng(`sudoku:${seed}:${difficulty}`);
  const solution = solve(new Array(81).fill(0), 1, rng).first as SudokuGrid;

  // 무작위 순서로 칸을 비우되, 정답이 하나로 유지될 때만 비운다.
  const givens = [...solution];
  let clues = 81;
  for (const i of shuffle(
    Array.from({ length: 81 }, (_, k) => k),
    rng,
  )) {
    if (clues <= CLUES[difficulty]) break;
    const kept = givens[i];
    givens[i] = 0;
    if (hasUniqueSolution(givens)) clues--;
    else givens[i] = kept;
  }
  return { givens, solution };
}

// 같은 행·열·상자에 같은 숫자가 있는 칸
export function findConflicts(values: SudokuGrid): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (!values[i]) continue;
    for (let j = i + 1; j < 81; j++) {
      if (values[j] !== values[i]) continue;
      if (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || boxOf(i) === boxOf(j)) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
  }
  return conflicts;
}

export function isPeer(a: number, b: number): boolean {
  return a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b));
}
