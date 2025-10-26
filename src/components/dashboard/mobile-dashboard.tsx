'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ClipboardList, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileDashboardProps {
  user: any
  workRequests: any[]
  workPlans: any[]
  workLogs: any[]
  payouts: any[]
}

export function MobileDashboard({ user, workRequests, workPlans, workLogs, payouts }: MobileDashboardProps) {
  const router = useRouter()

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'INSPECTOR': return 'ผู้ตรวจแปลง'
      case 'SUPERVISOR': return 'หัวหน้างาน'
      case 'WORKER': return 'พนักงาน'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ'
      case 'IN_PROGRESS': return 'กำลังดำเนินการ'
      case 'COMPLETED': return 'เสร็จสิ้น'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const pendingWorkRequests = workRequests.filter(wr => wr.status === 'PENDING').length
  const inProgressWorkRequests = workRequests.filter(wr => wr.status === 'IN_PROGRESS').length
  const completedWorkRequests = workRequests.filter(wr => wr.status === 'COMPLETED').length

  const pendingWorkPlans = workPlans.filter(wp => wp.status === 'PENDING').length
  const inProgressWorkPlans = workPlans.filter(wp => wp.status === 'IN_PROGRESS').length

  const pendingWorkLogs = workLogs.filter(wl => wl.status === 'PENDING').length
  const inProgressWorkLogs = workLogs.filter(wl => wl.status === 'IN_PROGRESS').length
  const completedWorkLogs = workLogs.filter(wl => wl.status === 'COMPLETED').length

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.netAmount, 0)
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING').length

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">สวัสดี</h1>
        <p className="text-lg text-gray-600 mb-2">
          {user.firstName} {user.lastName}
        </p>
        <Badge variant="outline" className="text-green-600 border-green-600">
          {getRoleDisplayName(user.role)}
        </Badge>
      </div>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-2 gap-4">
        {user.role === 'INSPECTOR' && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">งานรอดำเนินการ</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingWorkRequests}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">งานเสร็จสิ้น</p>
                  <p className="text-2xl font-bold text-green-600">{completedWorkRequests}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </>
        )}

        {user.role === 'SUPERVISOR' && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">แผนงานรอดำเนินการ</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingWorkPlans}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">พนักงานเข้าร่วม</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workPlans.reduce((sum, wp) => sum + wp.currentWorkers, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
          </>
        )}

        {user.role === 'WORKER' && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">งานรอดำเนินการ</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingWorkLogs}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">งานเสร็จสิ้น</p>
                  <p className="text-2xl font-bold text-green-600">{completedWorkLogs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </>
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">รายได้รวม</p>
              <p className="text-2xl font-bold text-green-600">฿{totalEarnings.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">การเข้าถึงด่วน</h2>
        
        {user.role === 'INSPECTOR' && (
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 h-auto"
            onClick={() => router.push('/work-requests')}
          >
            <div className="flex items-center">
              <ClipboardList className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">จัดการงานตรวจแปลง</p>
                <p className="text-sm text-gray-500">{pendingWorkRequests} งานรอดำเนินการ</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {user.role === 'SUPERVISOR' && (
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 h-auto"
            onClick={() => router.push('/work-plans')}
          >
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">จัดการแผนงาน</p>
                <p className="text-sm text-gray-500">{pendingWorkPlans} แผนงานรอดำเนินการ</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {user.role === 'WORKER' && (
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 h-auto"
            onClick={() => router.push('/my-jobs')}
          >
            <div className="flex items-center">
              <Clock className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">งานของฉัน</p>
                <p className="text-sm text-gray-500">{pendingWorkLogs} งานรอดำเนินการ</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        <Button 
          variant="outline" 
          className="w-full justify-between p-4 h-auto"
          onClick={() => router.push('/payouts')}
        >
          <div className="flex items-center">
            <DollarSign className="mr-3 h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">สรุปการจ่ายเงิน</p>
              <p className="text-sm text-gray-500">฿{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h2>
        
        {user.role === 'INSPECTOR' && workRequests.slice(0, 3).map((wr) => (
          <Card key={wr.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{wr.requestNo}</p>
                <p className="text-xs text-gray-600">{wr.customerName}</p>
              </div>
              <Badge className={getStatusColor(wr.status)}>
                {getStatusText(wr.status)}
              </Badge>
            </div>
          </Card>
        ))}

        {user.role === 'SUPERVISOR' && workPlans.slice(0, 3).map((wp) => (
          <Card key={wp.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{wp.workOrderNo}</p>
                <p className="text-xs text-gray-600">{wp.title}</p>
              </div>
              <Badge className={getStatusColor(wp.status)}>
                {getStatusText(wp.status)}
              </Badge>
            </div>
          </Card>
        ))}

        {user.role === 'WORKER' && workLogs.slice(0, 3).map((wl) => (
          <Card key={wl.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{wl.workPlanTitle}</p>
                <p className="text-xs text-gray-600">
                  {wl.vehicleType && `${wl.vehicleType} ${wl.vehicleLicensePlate}`}
                </p>
              </div>
              <Badge className={getStatusColor(wl.status)}>
                {getStatusText(wl.status)}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
