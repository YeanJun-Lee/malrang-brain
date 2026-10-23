// 날짜 키는 한국 시간 기준 'YYYY-MM-DD'. 오늘의 세트는 한국 시간 자정에 바뀐다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function toUtcMs(key: string): number {
  return Date.parse(`${key}T00:00:00Z`);
}

export function todayKey(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return new Date(toUtcMs(key) + days * DAY_MS).toISOString().slice(0, 10);
}

// 0 = 월요일 … 6 = 일요일
export function weekdayIndex(key: string): number {
  return (new Date(toUtcMs(key)).getUTCDay() + 6) % 7;
}

export function weekStart(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

export function formatKoreanDate(key: string): string {
  const d = new Date(toUtcMs(key));
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAYS[weekdayIndex(key)]}요일`;
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${String(s).padStart(2, '0')}초`;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
