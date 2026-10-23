import { sampleToday } from "./data/today";
import Home from "./pages/Home";

// 화면 전환은 플레이·자유 모드·기록·설정 화면을 만들 때 연결한다.
const noop = () => {};

function App() {
  return (
    <Home
      today={sampleToday}
      onStartPuzzle={noop}
      onContinueSet={noop}
      onOpenFreeMode={noop}
      onOpenRecords={noop}
      onOpenSettings={noop}
    />
  );
}

export default App;
