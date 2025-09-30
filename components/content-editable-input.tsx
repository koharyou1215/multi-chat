"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

interface ContentEditableInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  style?: React.CSSProperties;
}

export interface ContentEditableInputRef {
  focus: () => void;
  blur: () => void;
  getSelection: () => Selection | null;
}

/**
 * ContentEditable Input Component
 *
 * Safari-optimized input component that prevents the form navigation bar
 * while supporting multiline text input and proper focus management.
 */
export const ContentEditableInput = forwardRef<ContentEditableInputRef, ContentEditableInputProps>(
  ({ value, onChange, onKeyDown, placeholder, className, disabled, maxLength, style }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isEmpty, setIsEmpty] = useState(!value);

    useImperativeHandle(ref, () => ({
      focus: () => {
        divRef.current?.focus();
      },
      blur: () => {
        divRef.current?.blur();
      },
      getSelection: () => {
        return window.getSelection();
      },
    }));

    // Update content when value prop changes
    useEffect(() => {
      if (divRef.current && divRef.current.textContent !== value) {
        // Preserve cursor position
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const offset = range?.startOffset || 0;

        divRef.current.textContent = value;
        setIsEmpty(!value);

        // Restore cursor position
        if (range && selection) {
          try {
            const newRange = document.createRange();
            const textNode = divRef.current.firstChild;
            if (textNode) {
              const maxOffset = Math.min(offset, textNode.textContent?.length || 0);
              newRange.setStart(textNode, maxOffset);
              newRange.setEnd(textNode, maxOffset);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // Cursor position restoration failed, focus at end
            const range = document.createRange();
            range.selectNodeContents(divRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newValue = e.currentTarget.textContent || "";

      // Apply max length constraint
      if (maxLength && newValue.length > maxLength) {
        e.currentTarget.textContent = newValue.slice(0, maxLength);
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(e.currentTarget);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }

      setIsEmpty(!newValue);
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Prevent line breaks unless Shift+Enter
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onKeyDown?.(e);
        return;
      }

      onKeyDown?.(e);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");

      // Apply max length constraint
      const currentText = divRef.current?.textContent || "";
      const finalText = maxLength
        ? (currentText + text).slice(0, maxLength)
        : currentText + text;

      // Insert text at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      onChange(finalText);
    };

    return (
      <div className="relative">
        <div
          ref={divRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          className={cn(
            "w-full resize-none bg-transparent border-0 outline-none text-white placeholder:text-gray-400 focus:ring-0 text-base md:text-sm",
            "min-h-[40px] max-h-[200px] overflow-y-auto",
            "whitespace-pre-wrap break-words",
            // Safari-specific optimizations
            "[-webkit-appearance:none] [-webkit-user-select:text]",
            // Prevent zoom on focus (iOS)
            "[font-size:16px] md:[font-size:14px]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          style={{
            lineHeight: "1.5",
            WebkitAppearance: "none",
            WebkitUserSelect: "text",
            ...style,
          }}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        />

        {/* Placeholder */}
        {isEmpty && !isFocused && placeholder && (
          <div
            className="absolute inset-0 text-gray-400 pointer-events-none select-none flex items-start pt-2 pl-0"
            style={{ lineHeight: "1.5" }}
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }
);

ContentEditableInput.displayName = "ContentEditableInput";