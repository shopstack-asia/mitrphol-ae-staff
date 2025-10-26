'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useFuelStore } from '@/lib/stores/fuel-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Send,
  Fuel,
  Truck,
  Calendar,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function FuelRequestDetailPage() {
  const { user } = useAuthStore()
  const { fuelRequests, updateFuelRequest } = useFuelStore()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  const requestId = params.id as string
  const request = fuelRequests.find(req => req.id === requestId)

  if (!user || user.role !== 'FUEL_ATTENDANT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับพนักงานเติมน้ำมันเท่านั้น</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบคำขอเบิกน้ำมัน</h2>
          <p className="mt-2 text-sm text-gray-600">คำขอที่คุณกำลังมองหาไม่มีอยู่</p>
          <Link href="/fuel/requests">
            <Button className="mt-4">กลับไปรายการคำขอ</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'ร่าง'
      case 'APPROVED': return 'อนุมัติแล้ว'
      case 'REJECTED': return 'ปฏิเสธ'
      case 'COMPLETED': return 'เสร็จสิ้น'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
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

  const handleSubmitRequest = async () => {
    setIsLoading(true)
    
    try {
      updateFuelRequest(requestId, { 
        status: 'APPROVED',
        approvedBy: 'supervisor-01',
        approvedDate: new Date().toISOString()
      })
      
      alert('ส่งคำขอเบิกน้ำมันเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/fuel/requests">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอเบิกน้ำมัน</h1>
              <p className="text-sm text-gray-600">{request.requestNo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="space-y-6">
          {/* Request Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ข้อมูลคำขอ</CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{getStatusText(request.status)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">หมายเลขคำขอ</label>
                  <p className="text-sm text-gray-900">{request.requestNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">วันที่ขอ</label>
                  <p className="text-sm text-gray-900">{formatDate(request.requestDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ผู้ขอ</label>
                  <p className="text-sm text-gray-900">{request.requestedByName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ประเภทน้ำมัน</label>
                  <p className="text-sm text-gray-900">{request.fuelType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">จำนวนที่ขอ</label>
                  <p className="text-sm text-gray-900">{request.quantityRequested.toLocaleString()} ลิตร</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">รถบรรทุกน้ำมัน</label>
                  <p className="text-sm text-gray-900">{request.tankerName}</p>
                </div>
              </div>
              
              {request.remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
                  <p className="text-sm text-gray-900">{request.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Info */}
          {request.status !== 'DRAFT' && (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลการอนุมัติ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.approvedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ผู้อนุมัติ</label>
                      <p className="text-sm text-gray-900">{request.approvedBy}</p>
                    </div>
                  )}
                  {request.approvedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">วันที่อนุมัติ</label>
                      <p className="text-sm text-gray-900">{formatDate(request.approvedDate)}</p>
                    </div>
                  )}
                  {request.completedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">วันที่เสร็จสิ้น</label>
                      <p className="text-sm text-gray-900">{formatDate(request.completedDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.status === 'DRAFT' && (
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังส่งคำขอ...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      ส่งคำขอเพื่ออนุมัติ
                    </>
                  )}
                </Button>
              )}
              
              {request.status === 'APPROVED' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">คำขอได้รับการอนุมัติแล้ว</p>
                  <p className="text-xs text-gray-500 mt-1">
                    สามารถเริ่มการแจกจ่ายน้ำมันได้
                  </p>
                </div>
              )}
              
              {request.status === 'COMPLETED' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">คำขอเสร็จสิ้นแล้ว</p>
                </div>
              )}
              
              {request.status === 'REJECTED' && (
                <div className="text-center py-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">คำขอถูกปฏิเสธ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
