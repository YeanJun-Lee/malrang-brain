// 홈 화면이 쓰는 오늘의 세트 데이터 형태와 예시 값.
// 실제 값은 이후 storage 연동에서 채운다.

export type PuzzleKind = 'sudoku' | 'nonogram' | 'minesweeper';

export type PuzzleStatus =
  | { state: 'todo' }
  | { state: 'in-progress' }
  | { state: 'done'; seconds: number };

export type TodayPuzzle = {
  kind: PuzzleKind;
  name: string;
  emoji: string;
  difficulty: '쉬움' | '보통' | '어려움';
  status: PuzzleStatus;
};

export type TodayState = {
  date: Date;
  streakDays: number;
  // 이번 주 월요일부터 일요일까지 세트를 끝낸 날
  weekDone: boolean[];
  puzzles: TodayPuzzle[];
};

export const sampleToday: TodayState = {
  date: new Date(2026, 9, 23),
  streakDays: 4,
  weekDone: [true, true, true, false, false, false, false],
  puzzles: [
    { kind: 'sudoku', name: '스도쿠', emoji: '🔢', difficulty: '보통', status: { state: 'done', seconds: 312 } },
    { kind: 'nonogram', name: '노노그램', emoji: '🎨', difficulty: '쉬움', status: { state: 'in-progress' } },
    { kind: 'minesweeper', name: '지뢰찾기', emoji: '🚩', difficulty: '보통', status: { state: 'todo' } },
  ],
};
