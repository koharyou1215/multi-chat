"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  panelId?: string;
}

export class PanelErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("Panel error boundary caught:", error);
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Panel error details:", {
      panelId: this.props.panelId,
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState((prev) => ({
      hasError: false,
      error: undefined,
      errorCount: prev.errorCount + 1,
    }));

    // Force refresh if error persists
    if (this.state.errorCount > 2) {
      console.warn("Multiple errors detected, forcing page reload...");
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleReset);
      }

      return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl border border-red-500/30">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex p-3 bg-red-500/20 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                パネルエラーが発生しました
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {this.props.panelId && `Panel ID: ${this.props.panelId}`}
              </p>
              <p className="text-xs text-gray-500 font-mono bg-black/30 p-2 rounded">
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={this.handleReset}
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再試行
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/20 hover:bg-white/10"
              >
                ページ更新
              </Button>
            </div>

            {this.state.errorCount > 0 && (
              <p className="text-xs text-yellow-400">
                再試行回数: {this.state.errorCount}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}