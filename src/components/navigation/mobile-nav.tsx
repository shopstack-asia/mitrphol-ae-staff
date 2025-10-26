'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  ClipboardList, 
  Clock, 
  DollarSign, 
  User,
  Calendar,
  Users
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    name: 'หน้าแรก',
    href: '/dashboard',
    icon: Home,
    roles: ['INSPECTOR', 'SUPERVISOR', 'WORKER']
  },
  {
    name: 'งานตรวจแปลง',
    href: '/work-requests',
    icon: ClipboardList,
    roles: ['INSPECTOR']
  },
  {
    name: 'แผนงาน',
    href: '/work-plans',
    icon: Calendar,
    roles: ['SUPERVISOR']
  },
  {
    name: 'งานของฉัน',
    href: '/my-jobs',
    icon: Clock,
    roles: ['WORKER']
  },
  {
    name: 'การจ่ายเงิน',
    href: '/payouts',
    icon: DollarSign,
    roles: ['WORKER']
  },
  {
    name: 'โปรไฟล์',
    href: '/profile',
    icon: User,
    roles: ['INSPECTOR', 'SUPERVISOR', 'WORKER']
  }
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="flex w-full">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all duration-200 flex-1",
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-colors",
                isActive ? "text-green-600" : "text-gray-500"
              )} />
              <span className="truncate text-center leading-tight">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
