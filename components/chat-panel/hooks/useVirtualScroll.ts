import { useRef, useState, useCallback, useEffect } from 'react';
import { TIMING } from '@/lib/constants';

interface VirtualScrollOptions {
  itemHeight?: number;
  overscan?: number;
  scrollThreshold?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions = {}
) {
  const {
    itemHeight = TIMING.ITEM_HEIGHT || 80,
    overscan = 5,
    scrollThreshold = TIMING.SCROLL_THRESHOLD || 100,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // Calculate visible items
  const visibleItems = items.slice(
    visibleRange.start,
    Math.min(visibleRange.end, items.length)
  );

  // Calculate spacer heights
  const spacerHeights = {
    top: visibleRange.start * itemHeight,
    bottom: Math.max(0, (items.length - visibleRange.end) * itemHeight),
  };

  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(
      start + visibleCount + overscan * 2,
      items.length
    );

    setVisibleRange(prev => {
      if (prev.start !== start || prev.end !== end) {
        return { start, end };
      }
      return prev;
    });
  }, [items.length, itemHeight, overscan]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - scrollThreshold;

    if (isNearBottom) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [scrollThreshold]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;

    const targetScrollTop = index * itemHeight;
    containerRef.current.scrollTop = targetScrollTop;
  }, [itemHeight]);

  // Update scroll on items change
  useEffect(() => {
    scrollToBottom();
  }, [items.length, scrollToBottom]);

  return {
    containerRef,
    visibleItems,
    spacerHeights,
    handleScroll,
    scrollToBottom,
    scrollToIndex,
    visibleRange,
  };
}