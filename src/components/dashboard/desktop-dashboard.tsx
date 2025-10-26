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
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DesktopDashboardProps {
  user: any
  workRequests: any[]
  workPlans: any[]
  workLogs: any[]
  payouts: any[]
}

export function DesktopDashboard({ user, workRequests, workPlans, workLogs, payouts }: DesktopDashboardProps) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
              <p className="text-sm text-gray-600">
                สวัสดี {user.firstName} {user.lastName} ({getRoleDisplayName(user.role)})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === 'INSPECTOR' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">งานที่รอดำเนินการ</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingWorkRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    +{inProgressWorkRequests} กำลังดำเนินการ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">งานที่เสร็จสิ้น</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedWorkRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    งานที่เสร็จสิ้นแล้ว
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'SUPERVISOR' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">แผนงานรอดำเนินการ</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingWorkPlans}</div>
                  <p className="text-xs text-muted-foreground">
                    +{inProgressWorkPlans} กำลังดำเนินการ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">พนักงานที่เข้าร่วม</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workPlans.reduce((sum, wp) => sum + wp.currentWorkers, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    พนักงานที่เข้าร่วมงาน
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'WORKER' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">งานที่รอดำเนินการ</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingWorkLogs}</div>
                  <p className="text-xs text-muted-foreground">
                    +{inProgressWorkLogs} กำลังดำเนินการ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">งานที่เสร็จสิ้น</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedWorkLogs}</div>
                  <p className="text-xs text-muted-foreground">
                    งานที่เสร็จสิ้นแล้ว
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPayouts > 0 && `+${pendingPayouts} รอการจ่าย`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการล่าสุด</CardTitle>
              <CardDescription>งานที่คุณเกี่ยวข้องล่าสุด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === 'INSPECTOR' && workRequests.slice(0, 3).map((wr) => (
                <div key={wr.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{wr.requestNo}</p>
                    <p className="text-sm text-gray-600">{wr.customerName}</p>
                    <p className="text-xs text-gray-500">{wr.plotName}</p>
                  </div>
                  <Badge className={getStatusColor(wr.status)}>
                    {getStatusText(wr.status)}
                  </Badge>
                </div>
              ))}

              {user.role === 'SUPERVISOR' && workPlans.slice(0, 3).map((wp) => (
                <div key={wp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{wp.workOrderNo}</p>
                    <p className="text-sm text-gray-600">{wp.title}</p>
                    <p className="text-xs text-gray-500">{wp.workLocation}</p>
                  </div>
                  <Badge className={getStatusColor(wp.status)}>
                    {getStatusText(wp.status)}
                  </Badge>
                </div>
              ))}

              {user.role === 'WORKER' && workLogs.slice(0, 3).map((wl) => (
                <div key={wl.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{wl.workPlanTitle}</p>
                    <p className="text-sm text-gray-600">
                      {wl.vehicleType && `${wl.vehicleType} ${wl.vehicleLicensePlate}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {wl.workHours > 0 && `${wl.workHours} ชั่วโมง`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(wl.status)}>
                    {getStatusText(wl.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การเข้าถึงด่วน</CardTitle>
              <CardDescription>เมนูหลักสำหรับบทบาทของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.role === 'INSPECTOR' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/work-requests')}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    จัดการงานตรวจแปลง
                  </Button>
                </>
              )}

              {user.role === 'SUPERVISOR' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/work-plans')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    จัดการแผนงาน
                  </Button>
                </>
              )}

              {user.role === 'WORKER' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/my-jobs')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    งานของฉัน
                  </Button>
                </>
              )}

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/payouts')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                สรุปการจ่ายเงิน
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
