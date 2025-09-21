'use client'

import { useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { migrateStorageData } from '@/lib/storage-migrator'

export default function Home() {
  useEffect(() => {
    // Run storage migration on app startup
    migrateStorageData()
  }, [])

  return <MainLayout />
}