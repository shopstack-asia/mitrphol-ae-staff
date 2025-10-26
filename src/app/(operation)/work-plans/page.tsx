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
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function WorkPlansPage() {
  const { user } = useAuthStore()
  const { getWorkPlansByUser, updateWorkPlan } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

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

  const workPlans = getWorkPlansByUser(user.id)
  
  const filteredPlans = workPlans.filter(plan => {
    const matchesSearch = 
      plan.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.workLocation.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter
    
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
      day: 'numeric'
    })
  }

  const handleAcceptPlan = (planId: string) => {
    updateWorkPlan(planId, { status: 'IN_PROGRESS' })
  }

  const handleShowQR = (planId: string) => {
    // Mock QR code display
    alert(`QR Code สำหรับแผนงาน ${planId}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แผนงาน</h1>
              <p className="text-sm text-gray-600">
                จัดการแผนงานและทีมงาน
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาแผนงาน..."
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

        {/* Work Plans List */}
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีแผนงาน</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'ไม่พบแผนงานที่ตรงกับเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีแผนงานที่ได้รับมอบหมาย'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow" style={{ paddingBottom: 0 }}>
                <CardContent className="p-0">
                  <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.workOrderNo}
                        </h3>
                        <Badge className={getStatusColor(plan.status)}>
                          {getStatusIcon(plan.status)}
                          <span className="ml-1">{getStatusText(plan.status)}</span>
                        </Badge>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-800 mb-2">
                        {plan.title}
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{plan.workLocation}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>วันที่: {formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>พนักงาน: {plan.currentWorkers}/{plan.requiredPersonnel} คน</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2">
                      <Link href={`/work-plans/${plan.id}`}>
                        <Button variant="outline" size="sm">
                          ดูรายละเอียด
                        </Button>
                      </Link>
                      
                      {plan.status === 'PENDING' && (
                        <Button 
                          onClick={() => handleAcceptPlan(plan.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          เริ่มงาน
                        </Button>
                      )}
                      
                      {plan.status === 'IN_PROGRESS' && (
                        <Button 
                          onClick={() => handleShowQR(plan.id)}
                          variant="outline"
                          size="sm"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          แสดง QR
                        </Button>
                      )}
                    </div>
                  </div>
                  </div>
                  
                  {/* Action Tabs - Bottom Section */}
                  <div className="border-t border-gray-200">
                    <div className="flex">
                      <Link href={`/work-plans/${plan.id}`} className="flex-1">
                        <div className="p-4 text-center border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">ดูรายละเอียด</span>
                        </div>
                      </Link>
                      
                      {plan.status === 'PENDING' && (
                        <div 
                          onClick={() => handleAcceptPlan(plan.id)}
                          className="flex-1 p-4 text-center hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Play className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">เริ่มงาน</span>
                          </div>
                        </div>
                      )}
                      
                      {plan.status === 'IN_PROGRESS' && (
                        <div 
                          onClick={() => handleShowQR(plan.id)}
                          className="flex-1 p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <QrCode className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">แสดง QR</span>
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
