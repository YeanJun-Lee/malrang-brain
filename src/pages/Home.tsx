import { ChevronRight } from '../components/icons';
import { WEEKDAYS, formatKoreanDate, formatSeconds, weekdayIndex } from '../lib/date';
import { DIFFICULTY_LABEL, PUZZLES, type PuzzleKind } from '../puzzles/catalog';
import type { PuzzleStatus, TodayState } from '../state/today';
import './Home.css';

type HomeProps = {
  today: TodayState;
  onStartPuzzle: (kind: PuzzleKind) => void;
  onContinueSet: () => void;
  onOpenFreeMode: () => void;
  onOpenRecords: () => void;
  onOpenSettings: () => void;
};

function statusLabel(status: PuzzleStatus) {
  if (status.state === 'done') return `완료 · ${formatSeconds(status.seconds)}`;
  if (status.state === 'in-progress') return '풀고 있어요';
  return '아직 안 풀었어요';
}

export default function Home({
  today,
  onStartPuzzle,
  onContinueSet,
  onOpenFreeMode,
  onOpenRecords,
  onOpenSettings,
}: HomeProps) {
  const doneCount = today.puzzles.filter((p) => p.status.state === 'done').length;
  const total = today.puzzles.length;
  const allDone = doneCount === total;
  const started = today.puzzles.some((p) => p.status.state !== 'todo');
  const todayIndex = weekdayIndex(today.date);
  const level = DIFFICULTY_LABEL[today.difficulty];

  const ctaLabel = allDone ? '오늘 세트를 다 풀었어요' : started ? '이어 풀기' : '오늘의 세트 시작';

  return (
    <div className="home">
      <section className="home-hero">
        <p className="home-date">{formatKoreanDate(today.date)}</p>
        <h1 className="home-title">오늘의 두뇌 깨우기</h1>
        <p className="home-progress">
          {total}개 중 <strong>{doneCount}개</strong> 풀었어요
        </p>
      </section>

      <section className="home-card home-streak" aria-label="연속 기록">
        <div className="home-streak-head">
          <span className="home-streak-emoji tf" aria-hidden="true">
            🔥
          </span>
          <p className="home-streak-days">
            {today.streakDays > 0 ? (
              <>
                <strong>{today.streakDays}일</strong> 연속으로 풀었어요
              </>
            ) : (
              '오늘 세트를 풀면 연속 기록이 시작돼요'
            )}
          </p>
        </div>
        <ol className="home-week">
          {WEEKDAYS.map((day, i) => (
            <li
              key={day}
              className={[
                'home-week-day',
                today.weekDone[i] ? 'is-done' : '',
                i === todayIndex ? 'is-today' : '',
              ].join(' ')}
            >
              <span className="home-week-dot" aria-hidden="true" />
              <span className="home-week-label">{day}</span>
              <span className="visually-hidden">{today.weekDone[i] ? '완료' : '미완료'}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" aria-labelledby="home-set-title">
        <h2 id="home-set-title" className="home-section-title">
          오늘의 세트
        </h2>
        <ul className="home-card home-list">
          {today.puzzles.map(({ kind, status }) => {
            const content = (
              <>
                <span className={`home-row-icon kind-${kind} tf`} aria-hidden="true">
                  {PUZZLES[kind].emoji}
                </span>
                <span className="home-row-text">
                  <span className="home-row-name">
                    {PUZZLES[kind].name}
                    <span className="home-row-level">{level}</span>
                  </span>
                  <span className={`home-row-status status-${status.state}`}>{statusLabel(status)}</span>
                </span>
              </>
            );
            // 다 푼 퍼즐은 다시 열지 않는다(다시 풀면 기록이 덮어써진다)
            return (
              <li key={kind}>
                {status.state === 'done' ? (
                  <div className="home-row is-static">{content}</div>
                ) : (
                  <button type="button" className="home-row" onClick={() => onStartPuzzle(kind)}>
                    {content}
                    <span className="home-row-chevron">
                      <ChevronRight size={20} />
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="home-section" aria-label="더 보기">
        <ul className="home-card home-list">
          <li>
            <button type="button" className="home-row" onClick={onOpenFreeMode}>
              <span className="home-row-text">
                <span className="home-row-name">자유 모드</span>
                <span className="home-row-status">원하는 퍼즐과 난이도를 골라 풀어요</span>
              </span>
              <span className="home-row-chevron">
                <ChevronRight size={20} />
              </span>
            </button>
          </li>
          <li>
            <button type="button" className="home-row" onClick={onOpenRecords}>
              <span className="home-row-text">
                <span className="home-row-name">기록</span>
              </span>
              <span className="home-row-chevron">
                <ChevronRight size={20} />
              </span>
            </button>
          </li>
          <li>
            <button type="button" className="home-row" onClick={onOpenSettings}>
              <span className="home-row-text">
                <span className="home-row-name">설정</span>
              </span>
              <span className="home-row-chevron">
                <ChevronRight size={20} />
              </span>
            </button>
          </li>
        </ul>
      </section>

      <div className="home-cta-bar">
        <button type="button" className="home-cta" onClick={onContinueSet} disabled={allDone}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
