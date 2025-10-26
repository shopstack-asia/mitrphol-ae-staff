'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  ClipboardList, 
  Clock, 
  DollarSign, 
  User,
  Calendar,
  LogOut,
  Settings
} from 'lucide-react'
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
  }
]

export function DesktopNav() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  )

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'INSPECTOR': return 'ผู้ตรวจแปลง'
      case 'SUPERVISOR': return 'หัวหน้างาน'
      case 'WORKER': return 'พนักงาน'
      default: return role
    }
  }

  return (
    <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow pt-6 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">AE</span>
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">AE Operation</h1>
            <p className="text-sm text-gray-500">ระบบปฏิบัติการภาคสนาม</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-green-100 text-green-900 shadow-sm border border-green-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-4 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 rounded-xl hover:bg-gray-50">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-sm font-semibold">บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center p-3">
                  <User className="mr-3 h-4 w-4" />
                  โปรไฟล์
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center p-3">
                  <Settings className="mr-3 h-4 w-4" />
                  ตั้งค่า
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 p-3">
                <LogOut className="mr-3 h-4 w-4" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
