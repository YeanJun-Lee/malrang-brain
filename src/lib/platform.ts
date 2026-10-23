import {
  generateHapticFeedback,
  graniteEvent,
  NavigationBar,
  SafeArea,
  type HapticFeedbackType,
} from '@apps-in-toss/web-framework';
import { useEffect, useState } from 'react';

// 토스 앱 기능 호출을 한곳에 모은다. SDK를 쓸 수 없는 환경에서는 조용히 넘어간다.

type Insets = { top: number; right: number; bottom: number; left: number };

const ZERO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export function useSafeAreaInsets(): Insets {
  const [insets, setInsets] = useState<Insets>(() => {
    try {
      return SafeArea.get();
    } catch {
      return ZERO_INSETS;
    }
  });
  useEffect(() => {
    try {
      return SafeArea.subscribe({ onEvent: setInsets });
    } catch {
      return undefined;
    }
  }, []);
  return insets;
}

// 플레이 화면에서만 상단 바 배경을 투명하게 한다(게임용 내비게이션 바 권장 설정).
export function useTransparentNavigationBar(): void {
  useEffect(() => {
    NavigationBar.setOptions({ transparentBackground: true }).catch(() => {});
    return () => {
      NavigationBar.setOptions({ transparentBackground: false }).catch(() => {});
    };
  }, []);
}

// 시스템 뒤로가기를 가로챈다. 등록돼 있는 동안 기본 뒤로가기는 막힌다.
export function useBackEvent(onBack: () => void): void {
  useEffect(() => {
    try {
      return graniteEvent.addEventListener('backEvent', { onEvent: onBack });
    } catch {
      return undefined;
    }
  }, [onBack]);
}

export function haptic(type: HapticFeedbackType): void {
  generateHapticFeedback({ type }).catch(() => {});
}
