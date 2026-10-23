import { addDays } from '../lib/date';
import { loadJSON, removeKey, saveJSON } from '../lib/storage';
import type { PuzzleKind } from '../puzzles/catalog';

// 날짜별 세트 기록, 연속 기록, 진행 중인 판 저장.

export type PuzzleResult = { seconds: number };

export type DayRecord = {
  results: Partial<Record<PuzzleKind, PuzzleResult>>;
  started: PuzzleKind[];
  completed: boolean;
};

export type Streak = { count: number; lastDate: string | null };

const dayKey = (date: string) => `day:${date}`;
const gameKey = (puzzleId: string) => `game:${puzzleId}`;
const STREAK_KEY = 'streak';

const emptyDay = (): DayRecord => ({ results: {}, started: [], completed: false });

export async function loadDay(date: string): Promise<DayRecord> {
  return { ...emptyDay(), ...(await loadJSON<DayRecord>(dayKey(date))) };
}

export async function markStarted(date: string, kind: PuzzleKind): Promise<void> {
  const day = await loadDay(date);
  if (day.started.includes(kind)) return;
  await saveJSON(dayKey(date), { ...day, started: [...day.started, kind] });
}

// 퍼즐 결과를 저장하고, 세트를 다 풀었으면 completed를 표시한다. 저장된 기록을 돌려준다.
export async function saveResult(
  date: string,
  kind: PuzzleKind,
  seconds: number,
  setPuzzles: PuzzleKind[],
): Promise<DayRecord> {
  const day = await loadDay(date);
  const results = { ...day.results, [kind]: { seconds } };
  const next: DayRecord = {
    results,
    started: day.started.includes(kind) ? day.started : [...day.started, kind],
    completed: setPuzzles.every((k) => results[k]),
  };
  await saveJSON(dayKey(date), next);
  return next;
}

export async function loadStreak(): Promise<Streak> {
  return (await loadJSON<Streak>(STREAK_KEY)) ?? { count: 0, lastDate: null };
}

// 마지막으로 세트를 끝낸 날이 오늘이나 어제가 아니면 연속 기록은 끊긴 것이다.
export function currentStreak(streak: Streak, today: string): number {
  if (streak.lastDate === today || streak.lastDate === addDays(today, -1)) return streak.count;
  return 0;
}

// 오늘의 세트를 다 풀었을 때만 부른다. 지난 날 세트·자유 모드는 연속 기록에 넣지 않는다.
export async function recordSetComplete(today: string): Promise<Streak> {
  const streak = await loadStreak();
  if (streak.lastDate === today) return streak;
  const next: Streak = {
    count: streak.lastDate === addDays(today, -1) ? streak.count + 1 : 1,
    lastDate: today,
  };
  await saveJSON(STREAK_KEY, next);
  return next;
}

export type SavedGame = { state: unknown; elapsed: number };

export function loadGame(puzzleId: string): Promise<SavedGame | null> {
  return loadJSON<SavedGame>(gameKey(puzzleId));
}

export function saveGame(puzzleId: string, game: SavedGame): Promise<void> {
  return saveJSON(gameKey(puzzleId), game);
}

export function clearGame(puzzleId: string): Promise<void> {
  return removeKey(gameKey(puzzleId));
}
