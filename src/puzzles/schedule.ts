import { weekStart, weekdayIndex } from '../lib/date';
import { createRng, shuffle } from '../lib/rng';
import { IMPLEMENTED, PUZZLES, type Difficulty, type Family, type PuzzleKind } from './catalog';

// 오늘의 세트: 주 단위 시간표 + 요일 난이도. 같은 날에는 모든 사용자가 같은 세트를 푼다.

export const SET_SIZE = 3;

// 월~일
const DIFFICULTY_BY_WEEKDAY: Difficulty[] = ['easy', 'easy', 'normal', 'normal', 'normal', 'hard', 'easy'];

export type DailySet = {
  date: string;
  difficulty: Difficulty;
  puzzles: PuzzleKind[];
};

// 하루 최대 3개를 서로 다른 계열에서 고른다. 전날에 나온 퍼즐을 먼저 피하고,
// 그다음 이번 주에 덜 나온 퍼즐을 고른다. 동점은 주 시드로 섞은 순서를 따른다.
export function buildWeek(mondayKey: string, kinds: readonly PuzzleKind[] = IMPLEMENTED): PuzzleKind[][] {
  const rng = createRng(`week:${mondayKey}`);
  const used = new Map<PuzzleKind, number>(kinds.map((k) => [k, 0]));
  const size = Math.min(SET_SIZE, new Set(kinds.map((k) => PUZZLES[k].family)).size);

  const week: PuzzleKind[][] = [];
  let yesterday: PuzzleKind[] = [];
  for (let day = 0; day < 7; day++) {
    const today: PuzzleKind[] = [];
    const families = new Set<Family>();
    while (today.length < size) {
      const candidates = shuffle(kinds, rng).filter((k) => !today.includes(k) && !families.has(PUZZLES[k].family));
      candidates.sort(
        (a, b) =>
          Number(yesterday.includes(a)) - Number(yesterday.includes(b)) || (used.get(a) ?? 0) - (used.get(b) ?? 0),
      );
      const pick = candidates[0];
      today.push(pick);
      families.add(PUZZLES[pick].family);
      used.set(pick, (used.get(pick) ?? 0) + 1);
    }
    week.push(today);
    yesterday = today;
  }
  return week;
}

export function dailySet(dateKey: string): DailySet {
  const i = weekdayIndex(dateKey);
  return {
    date: dateKey,
    difficulty: DIFFICULTY_BY_WEEKDAY[i],
    puzzles: buildWeek(weekStart(dateKey))[i],
  };
}

export function dailyPuzzleId(dateKey: string, kind: PuzzleKind): string {
  return `daily:${dateKey}:${kind}`;
}
