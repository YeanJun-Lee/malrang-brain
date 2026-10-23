import { Storage } from '@apps-in-toss/web-framework';

// 앱 데이터 저장. SDK Storage를 쓰고, SDK를 쓸 수 없는 환경에서는 localStorage로 대신한다.

const PREFIX = 'mb:';

async function getRaw(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(PREFIX + key);
  } catch {
    return localStorage.getItem(PREFIX + key);
  }
}

async function setRaw(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(PREFIX + key, value);
  } catch {
    localStorage.setItem(PREFIX + key, value);
  }
}

export async function loadJSON<T>(key: string): Promise<T | null> {
  const raw = await getRaw(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  await setRaw(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  try {
    await Storage.removeItem(PREFIX + key);
  } catch {
    localStorage.removeItem(PREFIX + key);
  }
}
