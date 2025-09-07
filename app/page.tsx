'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { MainLayout } from '@/components/main-layout'
import { ApiKeyModal } from '@/components/api-key-modal'
import { validateApiKey } from '@/lib/utils'

export default function Home() {
  const { openRouterApiKey } = useAppStore()
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  useEffect(() => {
    if (!validateApiKey(openRouterApiKey)) {
      setShowApiKeyModal(true)
    }
  }, [openRouterApiKey])

  return (
    <div className="min-h-screen bg-background">
      <MainLayout />
      
      <ApiKeyModal 
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  )
}