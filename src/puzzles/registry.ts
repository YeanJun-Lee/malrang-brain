import type { ComponentType } from 'react';
import type { Difficulty, PuzzleKind } from './catalog';
import { SUDOKU_RULES } from './sudoku/rules';
import SudokuGame from './sudoku/SudokuGame';

// 퍼즐별 플레이 컴포넌트와 규칙 안내. 새 퍼즐은 여기와 catalog.ts의 IMPLEMENTED에 더한다.

export type GameProps = {
  seed: string;
  difficulty: Difficulty;
  // 저장해 둔 진행 상태. 형태는 퍼즐마다 다르다.
  initialState: unknown;
  disabled: boolean;
  onChange: (state: unknown) => void;
  onSolved: () => void;
};

export type PuzzleModule = {
  Game: ComponentType<GameProps>;
  rules: string[];
};

export const PUZZLE_MODULES: Partial<Record<PuzzleKind, PuzzleModule>> = {
  sudoku: { Game: SudokuGame, rules: SUDOKU_RULES },
};
