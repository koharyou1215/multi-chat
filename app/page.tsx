'use client'

import { useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { migrateStorageData } from '@/lib/storage-migrator'
import { useState } from 'react'

export default function Home() {
  const [cssLoaded, setCssLoaded] = useState<boolean | null>(null)

  useEffect(() => {
    // Run storage migration on app startup
    migrateStorageData()

    // Runtime diagnostic: check whether a known CSS class from globals.css is available
    const testEl = document.createElement('div')
    testEl.className = 'app-shell-bg'
    testEl.style.position = 'absolute'
    testEl.style.left = '-9999px'
    document.body.appendChild(testEl)

    // Give the browser one tick to apply CSS
    requestAnimationFrame(() => {
      const computed = window.getComputedStyle(testEl)
      const hasBackground = computed && computed.backgroundImage && computed.backgroundImage !== 'none'
      setCssLoaded(!!hasBackground)
      console.log('CSS diagnostics — app-shell-bg backgroundImage:', computed.backgroundImage)
      document.body.removeChild(testEl)
    })
  }, [])

  return (
    <>
      <MainLayout />
      {/* Small visible diagnostic for users: shows when global CSS appears missing */}
      {cssLoaded === false && (
        <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 9999 }}>
          <div style={{ background: 'rgba(255,0,0,0.9)', color: 'white', padding: '8px 12px', borderRadius: 8, fontWeight: 700 }}>
            グローバルCSSが読み込まれていない可能性があります。開発環境でCSSビルドを確認してください。
          </div>
        </div>
      )}
    </>
  )
}