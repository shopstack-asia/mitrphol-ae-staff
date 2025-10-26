'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { useDevice } from '@/lib/hooks/use-device'
import { MobileDashboard } from '@/components/dashboard/mobile-dashboard'
import { DesktopDashboard } from '@/components/dashboard/desktop-dashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isMobile, isTablet, isDesktop } = useDevice()
  const { 
    getWorkRequestsByUser, 
    getWorkPlansByUser, 
    getWorkLogsByUser, 
    getPayoutsByUser 
  } = useDataStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const workRequests = getWorkRequestsByUser(user.id)
  const workPlans = getWorkPlansByUser(user.id)
  const workLogs = getWorkLogsByUser(user.id)
  const payouts = getPayoutsByUser(user.id)

  // Mobile Layout (Mobile App Style)
  if (isMobile) {
    return (
      <MobileDashboard 
        user={user}
        workRequests={workRequests}
        workPlans={workPlans}
        workLogs={workLogs}
        payouts={payouts}
      />
    )
  }

  // Desktop Layout (Web Style)
  return (
    <DesktopDashboard 
      user={user}
      workRequests={workRequests}
      workPlans={workPlans}
      workLogs={workLogs}
      payouts={payouts}
    />
  )
}