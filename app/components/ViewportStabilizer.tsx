"use client";
import { useEffect } from "react";

export default function ViewportStabilizer() {
  useEffect(() => {
    // Prevent viewport scaling on input focus
    const preventScale = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content',
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }
    };

    // Handle keyboard visibility
    const handleKeyboard = () => {
      if (!window.visualViewport) return;

      let isKeyboardOpen = false;
      let lastHeight = window.innerHeight;

      const updateLayout = () => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDiff = lastHeight - currentHeight;

        // Keyboard is likely open if viewport height decreased by more than 100px
        const newKeyboardState = heightDiff > 100;

        if (newKeyboardState !== isKeyboardOpen) {
          isKeyboardOpen = newKeyboardState;
          const footer = document.querySelector('.broadcast-input-container, footer.layout-footer') as HTMLElement;

          if (footer) {
            if (isKeyboardOpen) {
              // Move footer above keyboard
              const keyboardHeight = heightDiff;
              footer.style.transform = `translateY(-${keyboardHeight}px)`;
              footer.style.transition = 'transform 0.3s ease-out';

              // Add class to body
              document.body.classList.add('keyboard-visible');
            } else {
              // Reset footer position
              footer.style.transform = 'translateY(0)';
              footer.style.transition = 'transform 0.3s ease-out';

              // Remove class from body
              document.body.classList.remove('keyboard-visible');
            }
          }
        }

        lastHeight = currentHeight;
      };

      // Listen to visual viewport changes
      if (window.visualViewport) {
        // Debounced resize handler to avoid rapid toggles
        let rafId: number | null = null
        const onVisualResize = () => {
          if (rafId) cancelAnimationFrame(rafId)
          rafId = requestAnimationFrame(() => updateLayout())
        }

        window.visualViewport.addEventListener('resize', onVisualResize);

        // Avoid preventing all scroll events; only prevent body bounce when keyboard is open
        const onVisualScroll = (e: Event) => {
          // If keyboard is open, keep viewport stable but don't blanket-prevent default
          if (isKeyboardOpen) {
            // Stop propagation on visualViewport scroll only
            e.stopPropagation()
            try {
              // Some browsers throw on calling preventDefault on passive listeners
              (e as Event & { preventDefault?: () => void }).preventDefault?.()
            } catch (err) {
              // ignore
            }
            window.scrollTo(0, 0);
          }
        }

        window.visualViewport.addEventListener('scroll', onVisualScroll as EventListener, { passive: false } as any);
      }

      // Also listen to window resize
      window.addEventListener('resize', updateLayout);

      // Input focus/blur handling for additional safety
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          preventScale();
          setTimeout(updateLayout, 100);
        }
      };

      const handleBlur = () => {
        setTimeout(updateLayout, 100);
      };

      document.addEventListener('focusin', handleFocus);
      document.addEventListener('focusout', handleBlur);

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateLayout);
        }
        window.removeEventListener('resize', updateLayout);
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('focusout', handleBlur);
      };
    };

    // Prevent bounce scrolling
    const preventBounce = () => {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';

      // Only allow scrolling in main content area
      const main = document.querySelector('.layout-main, main');
      if (main) {
        main.addEventListener('touchmove', (e) => {
          const target = e.target as HTMLElement;
          if (!main.contains(target)) {
            e.preventDefault();
          }
        }, { passive: false });
      }
    };

    // Initialize
    preventScale();
    preventBounce();
    const cleanup = handleKeyboard();

    return cleanup;
  }, []);

  return null;
}