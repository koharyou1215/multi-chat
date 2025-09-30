"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

interface MessageRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export function MessageRenderer({ content, className, isUser = false }: MessageRendererProps) {
  // Always display full content
  const displayContent = content;
  // カスタムコンポーネント定義
  const components: Components = {
    // コードブロック
    code({ className: codeClassName, children, ...props }: { className?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : '';
      const inline = !codeClassName || !codeClassName.startsWith('language-');

      if (!inline) {
        return (
          <div className="relative my-3">
            {language && (
              <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800/50 rounded-bl">
                {language}
              </div>
            )}
            <pre className="overflow-x-auto rounded-lg bg-gray-900/50 border border-gray-700/50 p-3">
              <code className="text-sm text-gray-200" {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }
      return (
        <code className="px-1.5 py-0.5 mx-1 rounded bg-gray-800/50 text-purple-300 text-sm" {...props}>
          {children}
        </code>
      );
    },

    // 段落
    p({ children }) {
      return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
    },

    // 見出し
    h1({ children }) {
      return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>;
    },

    // リスト
    ul({ children }) {
      return <ul className="list-disc list-inside mb-2 space-y-1 pl-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-2 space-y-1 pl-2">{children}</ol>;
    },
    li({ children }) {
      return <li className="leading-relaxed">{children}</li>;
    },

    // リンク
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity",
            isUser ? "text-blue-200 hover:text-blue-100" : "text-purple-300 hover:text-purple-200"
          )}
        >
          {children}
        </a>
      );
    },

    // 引用
    blockquote({ children }) {
      return (
        <blockquote className={cn(
          "border-l-4 pl-3 my-2 italic",
          isUser ? "border-purple-400/50" : "border-gray-600"
        )}>
          {children}
        </blockquote>
      );
    },

    // 水平線
    hr() {
      return <hr className="my-4 border-gray-700" />;
    },

    // テーブル
    table({ children }) {
      return (
        <div className="overflow-x-auto my-3">
          <table className="min-w-full border-collapse border border-gray-700">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-gray-800/50">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="border-b border-gray-700">{children}</tr>;
    },
    th({ children }) {
      return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
    },
    td({ children }) {
      return <td className="px-3 py-2">{children}</td>;
    },

    // 強調
    strong({ children }) {
      return <strong className="font-bold">{children}</strong>;
    },
    em({ children }) {
      return <em className="italic">{children}</em>;
    },

    // 削除線
    del({ children }) {
      return <del className="line-through opacity-70">{children}</del>;
    },
  };

  return (
    <div className={cn("markdown-content relative", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}