'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  QrCode,
  Play,
  Square,
  Car,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function WorkPlanDetailPage() {
  const { user } = useAuthStore()
  const { workPlans, updateWorkPlan } = useDataStore()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const planId = params.id as string
  const plan = workPlans.find(p => p.id === planId)

  if (!user || user.role !== 'SUPERVISOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับหัวหน้างานเท่านั้น</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบแผนงาน</h2>
          <p className="mt-2 text-sm text-gray-600">แผนงานที่คุณกำลังมองหาไม่มีอยู่</p>
          <Link href="/work-plans">
            <Button className="mt-4">กลับไปรายการแผนงาน</Button>
          </Link>
        </div>
      </div>
    )
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAcceptPlan = async () => {
    setIsLoading(true)
    updateWorkPlan(planId, { status: 'IN_PROGRESS' })
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleShowQR = () => {
    setShowQR(true)
  }

  const handleCloseQR = () => {
    setShowQR(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/work-plans">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{plan.workOrderNo}</h1>
              <p className="text-sm text-gray-600">รายละเอียดแผนงาน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.title}</CardTitle>
                  <Badge className={getStatusColor(plan.status)}>
                    {getStatusIcon(plan.status)}
                    <span className="ml-1">{getStatusText(plan.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">หมายเลขคำสั่งงาน</Label>
                    <p className="text-sm text-gray-900">{plan.workOrderNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">หัวหน้างาน</Label>
                    <p className="text-sm text-gray-900">{plan.supervisorName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่เริ่ม</Label>
                    <p className="text-sm text-gray-900">{formatDate(plan.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่สิ้นสุด</Label>
                    <p className="text-sm text-gray-900">{formatDate(plan.endDate)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">คำอธิบาย</Label>
                  <p className="text-sm text-gray-900 mt-1">{plan.description}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">สถานที่ทำงาน</Label>
                  <p className="text-sm text-gray-900 mt-1">{plan.workLocation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>งานที่ต้องทำ</CardTitle>
                <CardDescription>
                  รายการงานที่ต้องดำเนินการ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>⏱️ {task.estimatedHours} ชั่วโมง</span>
                        <span>🎯 {task.requiredSkills.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>ยานพาหนะ</CardTitle>
                <CardDescription>
                  รายการยานพาหนะที่ใช้ในงาน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{vehicle.type}</p>
                        <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                      </div>
                    </div>
                    <div>
                      {vehicle.assignedTo ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ถูกใช้งาน
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-600">
                          ว่าง
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Joined Workers */}
            <Card>
              <CardHeader>
                <CardTitle>พนักงานที่เข้าร่วม</CardTitle>
                <CardDescription>
                  {plan.currentWorkers}/{plan.requiredPersonnel} คน
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plan.joinedWorkers.length > 0 ? (
                  <div className="space-y-3">
                    {plan.joinedWorkers.map((worker, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{worker.name}</p>
                            <p className="text-sm text-gray-600">
                              เข้าร่วม: {new Date(worker.joinedAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>
                        {worker.vehicleId && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            มีรถ
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">ยังไม่มีพนักงานเข้าร่วม</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.status === 'PENDING' && (
                  <Button
                    onClick={handleAcceptPlan}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังเริ่มงาน...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        เริ่มงาน
                      </>
                    )}
                  </Button>
                )}
                
                {plan.status === 'IN_PROGRESS' && (
                  <Button 
                    onClick={handleShowQR}
                    variant="outline"
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    แสดง QR Code
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>ความคืบหน้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>พนักงานที่เข้าร่วม</span>
                    <span>{plan.currentWorkers}/{plan.requiredPersonnel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(plan.currentWorkers / plan.requiredPersonnel) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {plan.currentWorkers >= plan.requiredPersonnel 
                      ? '✅ พนักงานครบตามที่ต้องการ' 
                      : `⚠️ ต้องการพนักงานเพิ่มอีก ${plan.requiredPersonnel - plan.currentWorkers} คน`
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Modal */}
            {showQR && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">QR Code สำหรับเข้าร่วมงาน</h3>
                    <div className="bg-gray-100 rounded-lg p-8 mb-4">
                      <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      ให้พนักงานสแกน QR Code นี้เพื่อเข้าร่วมงาน
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      QR Code: {plan.qrCode}
                    </p>
                    <Button onClick={handleCloseQR} className="w-full">
                      ปิด
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
