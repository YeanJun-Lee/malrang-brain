import { addDays, todayKey, weekStart } from '../lib/date';
import type { Difficulty, PuzzleKind } from '../puzzles/catalog';
import { dailySet } from '../puzzles/schedule';
import { currentStreak, loadDay, loadStreak } from './progress';

// 홈 화면이 쓰는 오늘의 상태.

export type PuzzleStatus =
  | { state: 'todo' }
  | { state: 'in-progress' }
  | { state: 'done'; seconds: number };

export type TodayPuzzle = { kind: PuzzleKind; status: PuzzleStatus };

export type TodayState = {
  date: string;
  difficulty: Difficulty;
  puzzles: TodayPuzzle[];
  streakDays: number;
  // 이번 주 월요일부터 일요일까지 세트를 끝낸 날
  weekDone: boolean[];
};

export async function loadToday(now: Date = new Date()): Promise<TodayState> {
  const date = todayKey(now);
  const set = dailySet(date);
  const monday = weekStart(date);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const [days, streak] = await Promise.all([
    Promise.all(weekDates.map((d) => (d > date ? null : loadDay(d)))),
    loadStreak(),
  ]);
  const day = days[weekDates.indexOf(date)] ?? { results: {}, started: [], completed: false };

  return {
    date,
    difficulty: set.difficulty,
    puzzles: set.puzzles.map((kind) => {
      const result = day.results[kind];
      if (result) return { kind, status: { state: 'done', seconds: result.seconds } };
      if (day.started.includes(kind)) return { kind, status: { state: 'in-progress' } };
      return { kind, status: { state: 'todo' } };
    }),
    streakDays: currentStreak(streak, date),
    weekDone: days.map((d) => d?.completed ?? false),
  };
}
