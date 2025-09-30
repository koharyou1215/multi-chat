import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix?: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return prefix ? `${prefix}-${id}` : id;
}

export function formatTimestamp(
  date: Date | string | number | null | undefined
): string {
  try {
    // 無効な値の場合は現在の時間を返す
    if (!date) {
      return new Intl.DateTimeFormat("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    }

    const dateObj = new Date(date);

    // 無効な日付の場合は現在の時間を返す
    if (isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    }

    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    // エラーが発生した場合は現在の時間を返す
    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function isImageFile(fileName: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
}

export function validateApiKey(key: string): boolean {
  // OpenRouter API keys start with "sk-or-"
  return key.length > 0 && (key.startsWith("sk-or-") || key.startsWith("sk-"));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Safari-specific utility functions
 */
export const SafariUtils = {
  /**
   * Check if running on Safari mobile
   */
  isSafariMobile: () => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    return /Safari/.test(ua) && /Mobile/.test(ua) && !/Chrome/.test(ua);
  },

  /**
   * Check if running on iPhone
   */
  isIPhone: () => {
    if (typeof window === 'undefined') return false;
    return /iPhone/.test(window.navigator.userAgent);
  },

  /**
   * Get safe area insets
   */
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0 };

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    };
  },

  /**
   * Prevent iOS zoom on input focus
   */
  preventZoom: (element: HTMLElement) => {
    if (!SafariUtils.isSafariMobile()) return;

    const style = element.style as CSSStyleDeclaration & {
      webkitAppearance: string;
      webkitTouchCallout: string;
    };
    style.fontSize = '16px';
    style.webkitAppearance = 'none';
    style.webkitTouchCallout = 'none';
  },

  /**
   * Enable better text selection for contentEditable
   */
  enableTextSelection: (element: HTMLElement) => {
    if (!SafariUtils.isSafariMobile()) return;

    const style = element.style as CSSStyleDeclaration & {
      webkitUserSelect: string;
      webkitTouchCallout: string;
    };
    style.webkitUserSelect = 'text';
    style.webkitTouchCallout = 'default';
  },

  /**
   * Fix viewport height for Safari
   */
  fixViewportHeight: () => {
    if (typeof window === 'undefined' || !SafariUtils.isSafariMobile()) return;

    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  },
};