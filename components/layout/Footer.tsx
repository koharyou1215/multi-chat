"use client";

import { BroadcastInput } from "../broadcast-input";
import { zIndex } from "@/lib/config";
import { cn } from "@/lib/utils";

interface FooterProps {
  isMobile: boolean;
}

export function Footer({ isMobile }: FooterProps) {
  return (
    <footer
      data-app-footer
      className={cn(
        "layout-footer",
        "border-t border-purple-400/20 bg-slate-900/95 backdrop-blur-lg",
        isMobile && "mobile-footer",
        zIndex("FOOTER")
      )}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 0,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="px-3 py-2">
        <BroadcastInput />
      </div>
    </footer>
  );
}
