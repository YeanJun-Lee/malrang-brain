import { useMemo, useRef, useState } from 'react';
import type { GameProps } from '../registry';
import { colOf, findConflicts, generateSudoku, isPeer, rowOf, type SudokuPuzzle } from './engine';
import './Sudoku.css';

// 저장되는 진행 상태. notes는 칸마다 후보 숫자 비트(1~9).
type SudokuState = { values: number[]; notes: number[] };

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HISTORY_LIMIT = 100;

function restore(saved: unknown, puzzle: SudokuPuzzle): SudokuState {
  const s = saved as Partial<SudokuState> | null;
  if (s && Array.isArray(s.values) && s.values.length === 81 && Array.isArray(s.notes) && s.notes.length === 81) {
    // 주어진 칸은 저장값과 상관없이 항상 문제의 값으로 둔다
    return { values: s.values.map((v, i) => puzzle.givens[i] || v), notes: s.notes };
  }
  return { values: [...puzzle.givens], notes: new Array(81).fill(0) };
}

export default function SudokuGame({ seed, difficulty, initialState, disabled, onChange, onSolved }: GameProps) {
  const puzzle = useMemo(() => generateSudoku(seed, difficulty), [seed, difficulty]);
  const [state, setState] = useState(() => restore(initialState, puzzle));
  const [history, setHistory] = useState<SudokuState[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const solvedRef = useRef(false);

  const conflicts = useMemo(() => findConflicts(state.values), [state.values]);
  const placedCount = useMemo(() => {
    const count = new Array(10).fill(0);
    for (const v of state.values) count[v]++;
    return count;
  }, [state.values]);

  const editable = selected !== null && !puzzle.givens[selected] && !disabled;
  const selectedValue = selected === null ? 0 : state.values[selected];

  const commit = (next: SudokuState) => {
    setHistory((h) => [...h.slice(-(HISTORY_LIMIT - 1)), state]);
    setState(next);
    onChange(next);
    if (!solvedRef.current && next.values.every((v, i) => v === puzzle.solution[i])) {
      solvedRef.current = true;
      onSolved();
    }
  };

  const inputDigit = (d: number) => {
    if (!editable || selected === null) return;
    const values = [...state.values];
    const notes = [...state.notes];
    if (noteMode) {
      if (values[selected]) return;
      notes[selected] ^= 1 << d;
    } else {
      const value = values[selected] === d ? 0 : d;
      values[selected] = value;
      notes[selected] = 0;
      // 숫자를 넣으면 같은 줄·상자의 메모에서 그 숫자를 지운다
      if (value) {
        for (let i = 0; i < 81; i++) if (isPeer(selected, i)) notes[i] &= ~(1 << value);
      }
    }
    commit({ values, notes });
  };

  const erase = () => {
    if (!editable || selected === null) return;
    if (!state.values[selected] && !state.notes[selected]) return;
    const values = [...state.values];
    const notes = [...state.notes];
    values[selected] = 0;
    notes[selected] = 0;
    commit({ values, notes });
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev || disabled) return;
    setHistory((h) => h.slice(0, -1));
    setState(prev);
    onChange(prev);
  };

  return (
    <div className="sudoku">
      <div className="sudoku-board" role="grid" aria-label="스도쿠 판">
        {state.values.map((value, i) => {
          const given = puzzle.givens[i] !== 0;
          const classes = [
            'sudoku-cell',
            given ? 'is-given' : 'is-input',
            i === selected ? 'is-selected' : '',
            selected !== null && isPeer(selected, i) ? 'is-peer' : '',
            value && value === selectedValue && i !== selected ? 'is-same' : '',
            conflicts.has(i) ? 'is-conflict' : '',
            colOf(i) % 3 === 2 && colOf(i) !== 8 ? 'edge-right' : '',
            rowOf(i) % 3 === 2 && rowOf(i) !== 8 ? 'edge-bottom' : '',
          ];
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              className={classes.join(' ')}
              onClick={() => setSelected(i)}
              disabled={disabled}
              aria-label={`${rowOf(i) + 1}행 ${colOf(i) + 1}열, ${value || '빈칸'}`}
              aria-selected={i === selected}
            >
              {value ? (
                value
              ) : (
                <span className="sudoku-notes" aria-hidden="true">
                  {DIGITS.map((d) => (
                    <span key={d}>{state.notes[i] & (1 << d) ? d : ''}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sudoku-pad">
        {DIGITS.map((d) => (
          <button
            key={d}
            type="button"
            className="sudoku-key"
            onClick={() => inputDigit(d)}
            disabled={!editable || (!noteMode && placedCount[d] >= 9 && selectedValue !== d)}
          >
            {d}
          </button>
        ))}
        <button type="button" className="sudoku-key is-text" onClick={erase} disabled={!editable}>
          지우기
        </button>
      </div>

      <div className="sudoku-tools">
        <button
          type="button"
          className={`sudoku-tool ${noteMode ? 'is-on' : ''}`}
          onClick={() => setNoteMode((m) => !m)}
          aria-pressed={noteMode}
          disabled={disabled}
        >
          메모 {noteMode ? '켜짐' : '꺼짐'}
        </button>
        <button type="button" className="sudoku-tool" onClick={undo} disabled={disabled || history.length === 0}>
          되돌리기
        </button>
      </div>
    </div>
  );
}
