// 퍼즐 8종의 이름·계열. 구성 규칙은 docs/game-design.md.

export type PuzzleKind =
  | 'sudoku'
  | 'binary'
  | 'starBattle'
  | 'lightUp'
  | 'tents'
  | 'nonogram'
  | 'bridges'
  | 'minesweeper';

export type Family = 'number' | 'placement' | 'picture' | 'deduction';

export type Difficulty = 'easy' | 'normal' | 'hard';

export const PUZZLES: Record<PuzzleKind, { name: string; emoji: string; family: Family }> = {
  sudoku: { name: '스도쿠', emoji: '🔢', family: 'number' },
  binary: { name: '이진 퍼즐', emoji: '🔘', family: 'number' },
  starBattle: { name: '별 배치', emoji: '⭐', family: 'placement' },
  lightUp: { name: '라이트업', emoji: '💡', family: 'placement' },
  tents: { name: '텐트', emoji: '⛺', family: 'placement' },
  nonogram: { name: '노노그램', emoji: '🎨', family: 'picture' },
  bridges: { name: '다리 잇기', emoji: '🌉', family: 'picture' },
  minesweeper: { name: '지뢰찾기', emoji: '🚩', family: 'deduction' },
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

// 개발이 끝난 퍼즐만 오늘의 세트에 들어간다. 퍼즐을 추가하면 여기에 더한다.
// 출시 뒤에 이 목록을 바꾸면 지난 날 세트 구성도 바뀌므로, 그때는 적용 시작 주를 따로 둔다.
export const IMPLEMENTED: PuzzleKind[] = ['sudoku'];
