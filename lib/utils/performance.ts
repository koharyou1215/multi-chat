// Performance monitoring utilities for ChatPanel optimization

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  reRenderCount: number;
  bundleSize?: number;
}

export interface PerformanceObserverData {
  name: string;
  duration: number;
  startTime: number;
  type: string;
}

class ChatPanelPerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderCounts: Map<string, number> = new Map();
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      this.observer.observe({
        entryTypes: ['measure', 'navigation', 'paint', 'resource']
      });
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    if (entry.name.includes('ChatPanel')) {
      console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
    }
  }

  // Start performance measurement for a component
  startMeasurement(componentId: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${componentId}-start`);
    }
  }

  // End performance measurement for a component
  endMeasurement(componentId: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      const endMark = `${componentId}-end`;
      const measureName = `${componentId}-duration`;

      performance.mark(endMark);
      performance.measure(measureName, `${componentId}-start`, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      const duration = measure?.duration || 0;

      // Update metrics
      this.updateMetrics(componentId, { renderTime: duration });

      return duration;
    }
    return 0;
  }

  // Track component re-renders
  trackReRender(componentId: string): number {
    const currentCount = this.renderCounts.get(componentId) || 0;
    const newCount = currentCount + 1;
    this.renderCounts.set(componentId, newCount);

    this.updateMetrics(componentId, { reRenderCount: newCount });

    return newCount;
  }

  // Get memory usage (if available)
  getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  // Update metrics for a component
  private updateMetrics(componentId: string, updates: Partial<PerformanceMetrics>): void {
    const existing = this.metrics.get(componentId) || {
      renderTime: 0,
      memoryUsage: 0,
      componentCount: 1,
      reRenderCount: 0,
    };

    const updated: PerformanceMetrics = {
      ...existing,
      ...updates,
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.set(componentId, updated);
  }

  // Get metrics for a component
  getMetrics(componentId: string): PerformanceMetrics | null {
    return this.metrics.get(componentId) || null;
  }

  // Get all metrics
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Generate performance report
  generateReport(): string {
    const report = [];
    report.push('ChatPanel Performance Report');
    report.push('================================');
    report.push('');

    for (const [componentId, metrics] of this.metrics) {
      report.push(`Component: ${componentId}`);
      report.push(`  Render Time: ${metrics.renderTime.toFixed(2)}ms`);
      report.push(`  Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`);
      report.push(`  Re-renders: ${metrics.reRenderCount}`);
      report.push('');
    }

    const totalMemory = this.getMemoryUsage();
    report.push(`Total Memory Usage: ${totalMemory.toFixed(2)}MB`);

    return report.join('\n');
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.renderCounts.clear();
  }

  // Cleanup observer
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Singleton instance
const performanceMonitor = new ChatPanelPerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentId: string) => {
  const React = require('react');
  const { useEffect, useRef } = React;

  const renderCount = useRef(0);
  const startTime = useRef(undefined as number | undefined);

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();

    performanceMonitor.startMeasurement(componentId);
    performanceMonitor.trackReRender(componentId);

    return () => {
      if (startTime.current) {
        const endTime = performance.now();
        const duration = endTime - startTime.current;
        performanceMonitor.endMeasurement(componentId);

        if (duration > 16) { // Longer than 16ms (60fps threshold)
          console.warn(`Slow render detected for ${componentId}: ${duration.toFixed(2)}ms`);
        }
      }
    };
  });

  return {
    renderCount: renderCount.current,
    getMetrics: () => performanceMonitor.getMetrics(componentId),
  };
};

// Bundle size analysis utilities
export const analyzeBundleSize = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const jsResources = resources.filter(resource =>
      resource.name.includes('.js') &&
      (resource.name.includes('chunk') || resource.name.includes('bundle'))
    );

    let totalSize = 0;
    const bundleInfo = [];

    for (const resource of jsResources) {
      const size = resource.transferSize || resource.encodedBodySize || 0;
      totalSize += size;

      bundleInfo.push({
        name: resource.name.split('/').pop(),
        size: (size / 1024).toFixed(2) + 'KB',
        loadTime: (resource.responseEnd - resource.startTime).toFixed(2) + 'ms'
      });
    }

    console.group('Bundle Analysis');
    console.log(`Total Bundle Size: ${(totalSize / 1024).toFixed(2)}KB`);
    console.table(bundleInfo);
    console.groupEnd();
  }
};

// Performance testing utilities
export const runPerformanceTest = async (
  testName: string,
  testFunction: () => Promise<void> | void,
  iterations: number = 100
): Promise<number> => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await testFunction();
    const end = performance.now();
    times.push(end - start);
  }

  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Performance Test: ${testName}`);
  console.log(`Average: ${average.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);

  return average;
};

// Memory leak detection
export const detectMemoryLeaks = (): void => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
    const memory = (performance as any).memory;
    const initialMemory = memory.usedJSHeapSize;

    setTimeout(() => {
      const currentMemory = memory.usedJSHeapSize;
      const memoryIncrease = currentMemory - initialMemory;

      if (memoryIncrease > 5 * 1024 * 1024) { // 5MB increase
        console.warn(`Potential memory leak detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
      }
    }, 10000); // Check after 10 seconds
  }
};

export { performanceMonitor };
export default performanceMonitor;