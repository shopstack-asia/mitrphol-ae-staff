'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  Camera,
  Play,
  Square
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MyJobsPage() {
  const { user } = useAuthStore()
  const { getWorkLogsByUser, updateWorkLog } = useDataStore()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  if (!user || user.role !== 'WORKER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับพนักงานเท่านั้น</p>
        </div>
      </div>
    )
  }

  const workLogs = getWorkLogsByUser(user.id)
  
  const filteredLogs = workLogs.filter(log => {
    const matchesSearch = 
      log.workPlanTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.vehicleLicensePlate && log.vehicleLicensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStartJob = (logId: string) => {
    // เปิดหน้า detail เพื่อให้ worker ถ่ายรูปหรือกรอกเลขไมล์
    router.push(`/my-jobs/${logId}`)
  }

  const handleEndJob = (logId: string) => {
    // เปิดหน้า detail เพื่อให้ worker ถ่ายรูปหรือกรอกเลขไมล์
    router.push(`/my-jobs/${logId}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">งานของฉัน</h1>
              <p className="text-sm text-gray-600">
                จัดการงานที่ได้รับมอบหมาย
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหางาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ALL')}
                size="sm"
              >
                ทั้งหมด
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                size="sm"
              >
                รอดำเนินการ
              </Button>
              <Button
                variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('IN_PROGRESS')}
                size="sm"
              >
                กำลังดำเนินการ
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('COMPLETED')}
                size="sm"
              >
                เสร็จสิ้น
              </Button>
            </div>
          </div>
        </div>

        {/* Work Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีงาน</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีงานที่ได้รับมอบหมาย'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm" style={{ paddingBottom: 0 }}>
                <CardContent className="p-0">
                  {/* Main Content Area */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {log.workPlanTitle}
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusIcon(log.status)}
                          <span className="ml-1">{getStatusText(log.status)}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3">
                      {log.vehicleType && log.vehicleLicensePlate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Car className="h-4 w-4" />
                          <span>{log.vehicleType} {log.vehicleLicensePlate}</span>
                        </div>
                      )}
                      
                      {log.startTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>เริ่ม: {formatDate(log.startTime)}</span>
                        </div>
                      )}
                      
                      {log.workHours > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>ชั่วโมงทำงาน: {log.workHours} ชั่วโมง</span>
                        </div>
                      )}
                      
                      {log.startMileage && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>ไมล์เริ่มต้น: {log.startMileage.toLocaleString()} กม.</span>
                        </div>
                      )}
                      
                      {log.endMileage && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>ไมล์สิ้นสุด: {log.endMileage.toLocaleString()} กม.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Tabs - Bottom Section */}
                  <div className="border-t border-gray-200">
                    <div className="flex">
                      <Link href={`/my-jobs/${log.id}`} className="flex-1">
                        <div className="p-4 text-center border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">ดูรายละเอียด</span>
                        </div>
                      </Link>
                      
                      {log.status === 'PENDING' && (
                        <div 
                          onClick={() => handleStartJob(log.id)}
                          className="flex-1 p-4 text-center hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Camera className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">เริ่มงาน</span>
                          </div>
                        </div>
                      )}
                      
                      {log.status === 'IN_PROGRESS' && (
                        <div 
                          onClick={() => handleEndJob(log.id)}
                          className="flex-1 p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Camera className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">จบงาน</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
