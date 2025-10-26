'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DesktopNav } from '@/components/navigation/desktop-nav'
import { MobileNav } from '@/components/navigation/mobile-nav'
import Image from 'next/image'

export default function OperationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden lg:block">
        <DesktopNav />
      </div>

      {/* Mobile Header - Visible on mobile */}
      <div 
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
        style={{ display: 'block' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/icon.png"
                alt="AE Operation Icon"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">AE Operation</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:pl-72">
        <main className="lg:pb-0 pb-20 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Fixed at bottom, hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav />
      </div>
    </div>
  )
}
