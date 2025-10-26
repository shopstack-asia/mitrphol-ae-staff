'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useDevice } from '@/lib/hooks/use-device'
import { DesktopNav } from '@/components/navigation/desktop-nav'
import { MobileNav } from '@/components/navigation/mobile-nav'

export default function OperationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const { isMobile, isTablet, isDesktop } = useDevice()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Mobile Layout (Mobile App Style)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AE</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">AE Operation</span>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="pb-20 min-h-screen">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MobileNav />
        </div>
      </div>
    )
  }

  // Desktop Layout (Web Style)
  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopNav />
      <div className="lg:pl-72">
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
