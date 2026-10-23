import { useCallback, useEffect, useState } from "react";
import Home from "./pages/Home";
import DailyPlay from "./play/DailyPlay";
import type { PuzzleKind } from "./puzzles/catalog";
import { loadToday, type TodayState } from "./state/today";

type Screen = { name: "home" } | { name: "play"; kind: PuzzleKind };

// 자유 모드·기록·설정 화면은 만들 때 연결한다.
const noop = () => {};

function App() {
  const [today, setToday] = useState<TodayState | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  const refresh = useCallback(() => {
    loadToday().then(setToday);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const goHome = useCallback(() => {
    setScreen({ name: "home" });
    refresh();
  }, [refresh]);

  if (!today) return <p className="play-loading">불러오고 있어요</p>;

  if (screen.name === "play") {
    const remaining = today.puzzles
      .filter((p) => p.kind !== screen.kind && p.status.state !== "done")
      .map((p) => p.kind);
    return (
      <DailyPlay
        key={`${today.date}:${screen.kind}`}
        date={today.date}
        difficulty={today.difficulty}
        kind={screen.kind}
        setPuzzles={today.puzzles.map((p) => p.kind)}
        remaining={remaining}
        onHome={goHome}
        onNext={(kind) => {
          setScreen({ name: "play", kind });
          refresh();
        }}
      />
    );
  }

  const next = today.puzzles.find((p) => p.status.state !== "done");
  return (
    <Home
      today={today}
      onStartPuzzle={(kind) => setScreen({ name: "play", kind })}
      onContinueSet={() => next && setScreen({ name: "play", kind: next.kind })}
      onOpenFreeMode={noop}
      onOpenRecords={noop}
      onOpenSettings={noop}
    />
  );
}

export default App;
