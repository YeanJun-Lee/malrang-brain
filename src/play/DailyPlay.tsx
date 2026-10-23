import { useCallback, useEffect, useRef, useState } from 'react';
import { haptic, useBackEvent } from '../lib/platform';
import { DIFFICULTY_LABEL, PUZZLES, type Difficulty, type PuzzleKind } from '../puzzles/catalog';
import { PUZZLE_MODULES } from '../puzzles/registry';
import { dailyPuzzleId } from '../puzzles/schedule';
import {
  clearGame,
  loadGame,
  markStarted,
  recordSetComplete,
  saveGame,
  saveResult,
  type SavedGame,
} from '../state/progress';
import PlayShell, { type PlayResult, type PlaySheet } from './PlayShell';

// 오늘의 세트에서 퍼즐 하나를 푸는 화면. 저장된 판을 불러오고, 진행을 저장하고, 결과를 기록한다.
// 퍼즐이 바뀌면 새로 마운트되도록 부모에서 key를 퍼즐마다 다르게 준다.

type DailyPlayProps = {
  date: string;
  difficulty: Difficulty;
  kind: PuzzleKind;
  setPuzzles: PuzzleKind[];
  // 이 퍼즐 말고 아직 안 푼 세트 퍼즐
  remaining: PuzzleKind[];
  onHome: () => void;
  onNext: (kind: PuzzleKind) => void;
};

export default function DailyPlay(props: DailyPlayProps) {
  const puzzleId = dailyPuzzleId(props.date, props.kind);
  const [saved, setSaved] = useState<SavedGame | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadGame(puzzleId).then((game) => {
      if (alive) setSaved(game);
    });
    markStarted(props.date, props.kind);
    return () => {
      alive = false;
    };
  }, [puzzleId, props.date, props.kind]);

  if (saved === undefined) return <p className="play-loading">퍼즐을 준비하고 있어요</p>;
  return <PlaySession key={puzzleId} {...props} puzzleId={puzzleId} saved={saved} />;
}

function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

function useTimer(initial: number, running: boolean): number {
  const [elapsed, setElapsed] = useState(initial);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return elapsed;
}

const SAVE_DELAY_MS = 600;

function PlaySession({
  date,
  difficulty,
  kind,
  setPuzzles,
  remaining,
  onHome,
  onNext,
  puzzleId,
  saved,
}: DailyPlayProps & { puzzleId: string; saved: SavedGame | null }) {
  const module = PUZZLE_MODULES[kind];
  const [sheet, setSheet] = useState<PlaySheet>(null);
  const [result, setResult] = useState<PlayResult | null>(null);
  const visible = useDocumentVisible();
  const elapsed = useTimer(saved?.elapsed ?? 0, visible && !sheet && !result);

  const elapsedRef = useRef(elapsed);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);
  const stateRef = useRef<unknown>(saved?.state ?? null);
  const doneRef = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);

  const save = useCallback(() => {
    window.clearTimeout(saveTimer.current);
    if (doneRef.current || stateRef.current === null) return;
    saveGame(puzzleId, { state: stateRef.current, elapsed: elapsedRef.current });
  }, [puzzleId]);

  // 칸을 누를 때마다 저장하지 않고, 입력이 멈추면 한 번 저장한다
  const handleChange = useCallback(
    (state: unknown) => {
      stateRef.current = state;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(save, SAVE_DELAY_MS);
    },
    [save],
  );

  useEffect(() => {
    if (!visible) save();
  }, [visible, save]);

  useEffect(() => save, [save]);

  const handleSolved = useCallback(async () => {
    doneRef.current = true;
    window.clearTimeout(saveTimer.current);
    const seconds = elapsedRef.current;
    haptic('success');
    const day = await saveResult(date, kind, seconds, setPuzzles);
    await clearGame(puzzleId);
    if (day.completed) await recordSetComplete(date);
    setResult({ seconds, setComplete: day.completed, hasNext: remaining.length > 0 });
  }, [date, kind, setPuzzles, puzzleId, remaining.length]);

  const exit = useCallback(() => {
    save();
    onHome();
  }, [save, onHome]);

  const handleBack = useCallback(() => {
    if (result) onHome();
    else if (sheet) setSheet(null);
    else setSheet('pause');
  }, [result, sheet, onHome]);
  useBackEvent(handleBack);

  if (!module) return <p className="play-loading">아직 준비 중인 퍼즐이에요</p>;
  const { Game } = module;

  return (
    <PlayShell
      title={PUZZLES[kind].name}
      difficultyLabel={DIFFICULTY_LABEL[difficulty]}
      elapsed={elapsed}
      sheet={sheet}
      rules={module.rules}
      result={result}
      onPause={() => setSheet('pause')}
      onShowRules={() => setSheet('rules')}
      onCloseSheet={() => setSheet(null)}
      onExit={exit}
      onNext={() => onNext(remaining[0])}
    >
      <Game
        seed={puzzleId}
        difficulty={difficulty}
        initialState={saved?.state ?? null}
        disabled={sheet !== null}
        onChange={handleChange}
        onSolved={handleSolved}
      />
    </PlayShell>
  );
}
