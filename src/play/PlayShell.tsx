import type { ReactNode } from 'react';
import { Close } from '../components/icons';
import { formatClock, formatSeconds } from '../lib/date';
import { useSafeAreaInsets, useTransparentNavigationBar } from '../lib/platform';
import './PlayShell.css';

// 모든 퍼즐이 함께 쓰는 플레이 화면 틀: 상단 도구·타이머, 일시정지·규칙 시트, 결과.

export type PlaySheet = 'pause' | 'rules' | null;

export type PlayResult = {
  seconds: number;
  setComplete: boolean;
  hasNext: boolean;
};

type PlayShellProps = {
  title: string;
  difficultyLabel: string;
  elapsed: number;
  sheet: PlaySheet;
  rules: string[];
  result: PlayResult | null;
  onPause: () => void;
  onShowRules: () => void;
  onCloseSheet: () => void;
  onExit: () => void;
  onNext: () => void;
  children: ReactNode;
};

// 투명 상단 바의 ⋯·× 버튼 자리. 이 너비만큼 오른쪽을 비운다(실기기 확인 필요).
const NAV_BUTTONS_WIDTH = 96;

export default function PlayShell({
  title,
  difficultyLabel,
  elapsed,
  sheet,
  rules,
  result,
  onPause,
  onShowRules,
  onCloseSheet,
  onExit,
  onNext,
  children,
}: PlayShellProps) {
  useTransparentNavigationBar();
  const insets = useSafeAreaInsets();

  return (
    <div className="play" style={{ paddingTop: insets.top }}>
      <div className="play-toolbar" style={{ paddingRight: insets.right + NAV_BUTTONS_WIDTH }}>
        {!result && (
          <>
            <button type="button" className="play-chip" onClick={onPause}>
              일시정지
            </button>
            <button type="button" className="play-chip" onClick={onShowRules}>
              규칙
            </button>
          </>
        )}
      </div>

      <header className="play-header">
        <h1 className="play-title">
          {title}
          <span className="play-level">{difficultyLabel}</span>
        </h1>
        <p className="play-timer">
          <span className="visually-hidden">걸린 시간 </span>
          {formatClock(result ? result.seconds : elapsed)}
        </p>
      </header>

      {result ? (
        <section className="play-result" aria-live="polite">
          <p className="play-result-title">
            <span className="tf" aria-hidden="true">
              🎉
            </span>{' '}
            다 풀었어요
          </p>
          <p className="play-result-time">{formatSeconds(result.seconds)}</p>
          {result.setComplete && <p className="play-result-note">오늘의 세트를 모두 풀었어요</p>}
          <div className="play-result-actions">
            {result.hasNext && (
              <button type="button" className="play-button is-primary" onClick={onNext}>
                다음 퍼즐
              </button>
            )}
            <button
              type="button"
              className={`play-button ${result.hasNext ? 'is-secondary' : 'is-primary'}`}
              onClick={onExit}
            >
              홈으로
            </button>
          </div>
        </section>
      ) : (
        <div className={`play-board ${sheet === 'pause' ? 'is-covered' : ''}`}>{children}</div>
      )}

      {sheet && (
        <div className="play-sheet-layer">
          <button type="button" className="play-dim" aria-label="닫기" onClick={onCloseSheet} />
          <div className="play-sheet" role="dialog" aria-modal="true" aria-labelledby="play-sheet-title">
            <div className="play-sheet-head">
              <h2 id="play-sheet-title" className="play-sheet-title">
                {sheet === 'pause' ? '잠시 멈췄어요' : `${title} 규칙`}
              </h2>
              <button type="button" className="play-icon-button" aria-label="닫기" onClick={onCloseSheet}>
                <Close size={24} />
              </button>
            </div>

            {sheet === 'pause' ? (
              <>
                <p className="play-sheet-text">진행 상황은 저장돼요. 나중에 이어서 풀 수 있어요.</p>
                <div className="play-sheet-actions">
                  <button type="button" className="play-button is-primary" onClick={onCloseSheet}>
                    계속 풀기
                  </button>
                  <button type="button" className="play-button is-secondary" onClick={onExit}>
                    홈으로 나가기
                  </button>
                </div>
              </>
            ) : (
              <>
                <ol className="play-rules">
                  {rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ol>
                <div className="play-sheet-actions">
                  <button type="button" className="play-button is-primary" onClick={onCloseSheet}>
                    확인
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
