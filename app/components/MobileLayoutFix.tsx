'use client'

import { useEffect } from 'react'

export default function MobileLayoutFix() {
  useEffect(() => {
    // iOS Safari viewport height fix
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // Set initial height
    setViewportHeight()

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    // iOS specific: Handle keyboard show/hide
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Prevent bounce scrolling on iOS
      document.body.addEventListener('touchmove', (e: TouchEvent) => {
        // Allow scrolling only in scrollable areas
        const target = e.target as Element | null
        if (!target) {
          e.preventDefault()
          return
        }

        const scrollable = target.closest('.layout-main, .chat-panels-container, aside')
        if (!scrollable) {
          e.preventDefault()
        }
      }, { passive: false })

      // Handle visual viewport changes (keyboard)
      if ('visualViewport' in window) {
        const viewport = window.visualViewport
        if (!viewport) return

        const handleViewportChange = () => {
          // Guard: viewport may become null/undefined at runtime
          const currentViewport = window.visualViewport
          if (!currentViewport) return

          const hasKeyboard = window.innerHeight > currentViewport.height
          document.body.classList.toggle('keyboard-visible', hasKeyboard)

          // Use safe integer keyboard height and guard against negative values
          const keyboardHeight = Math.max(0, Math.round(window.innerHeight - currentViewport.height))

          const footer = document.querySelector('.mobile-footer') as HTMLElement | null
          if (footer) {
            // Apply transform only when keyboard height is significant
            if (hasKeyboard && keyboardHeight > 50) {
              footer.style.transform = `translateY(-${keyboardHeight}px)`
            } else {
              footer.style.transform = 'translateY(0)'
            }
          }

          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
        }

        viewport.addEventListener('resize', handleViewportChange)
        viewport.addEventListener('scroll', handleViewportChange)
      }
    }

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return null
}