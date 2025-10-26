'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useFuelStore } from '@/lib/stores/fuel-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Send
} from 'lucide-react'
import Link from 'next/link'

export default function FuelRequestsPage() {
  const { user } = useAuthStore()
  const { 
    fuelRequests, 
    fuelTypes, 
    equipments, 
    getFuelRequestsByUser, 
    createFuelRequest, 
    updateFuelRequest 
  } = useFuelStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state for creating new request
  const [newRequest, setNewRequest] = useState({
    fuelType: '',
    quantityRequested: '',
    assignedTanker: '',
    remarks: ''
  })

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

  const userRequests = getFuelRequestsByUser(user.id)
  
  const filteredRequests = userRequests.filter(request => {
    const matchesSearch = 
      request.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tankerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateRequest = async () => {
    if (!newRequest.fuelType || !newRequest.quantityRequested || !newRequest.assignedTanker) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setIsLoading(true)
    
    try {
      const tanker = equipments.find(eq => eq.id === newRequest.assignedTanker)
      
      createFuelRequest({
        requestDate: new Date().toISOString(),
        requestedBy: user.id,
        requestedByName: `${user.firstName} ${user.lastName}`,
        fuelType: newRequest.fuelType,
        quantityRequested: parseInt(newRequest.quantityRequested),
        assignedTanker: newRequest.assignedTanker,
        tankerName: tanker?.name || '',
        status: 'DRAFT',
        remarks: newRequest.remarks
      })

      // Reset form
      setNewRequest({
        fuelType: '',
        quantityRequested: '',
        assignedTanker: '',
        remarks: ''
      })
      
      setIsCreateDialogOpen(false)
      alert('สร้างคำขอเบิกน้ำมันเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error creating fuel request:', error)
      alert('เกิดข้อผิดพลาดในการสร้างคำขอ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitRequest = (requestId: string) => {
    updateFuelRequest(requestId, { 
      status: 'APPROVED',
      approvedBy: 'supervisor-01',
      approvedDate: new Date().toISOString()
    })
    alert('ส่งคำขอเบิกน้ำมันเรียบร้อยแล้ว')
  }

  const tankers = equipments.filter(eq => eq.type === 'Tanker')

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">คำขอเบิกน้ำมัน</h1>
              <p className="text-sm text-gray-600">
                จัดการคำขอเบิกน้ำมันจากคลังสินค้า
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างคำขอใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>สร้างคำขอเบิกน้ำมัน</DialogTitle>
                  <DialogDescription>
                    กรอกข้อมูลเพื่อสร้างคำขอเบิกน้ำมันใหม่
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fuelType">ประเภทน้ำมัน</Label>
                    <Select value={newRequest.fuelType} onValueChange={(value) => setNewRequest({...newRequest, fuelType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทน้ำมัน" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((fuelType) => (
                          <SelectItem key={fuelType.id} value={fuelType.name}>
                            {fuelType.nameThai} ({fuelType.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">จำนวนที่ขอ (ลิตร)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newRequest.quantityRequested}
                      onChange={(e) => setNewRequest({...newRequest, quantityRequested: e.target.value})}
                      placeholder="เช่น 1000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tanker">รถบรรทุกน้ำมัน</Label>
                    <Select value={newRequest.assignedTanker} onValueChange={(value) => setNewRequest({...newRequest, assignedTanker: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกรถบรรทุกน้ำมัน" />
                      </SelectTrigger>
                      <SelectContent>
                        {tankers.map((tanker) => (
                          <SelectItem key={tanker.id} value={tanker.id}>
                            {tanker.name} ({tanker.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="remarks">หมายเหตุ</Label>
                    <Textarea
                      id="remarks"
                      value={newRequest.remarks}
                      onChange={(e) => setNewRequest({...newRequest, remarks: e.target.value})}
                      placeholder="หมายเหตุเพิ่มเติม..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateRequest}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'กำลังสร้าง...' : 'สร้างคำขอ'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                  placeholder="ค้นหาคำขอเบิกน้ำมัน..."
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
                variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('DRAFT')}
                size="sm"
              >
                ร่าง
              </Button>
              <Button
                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('APPROVED')}
                size="sm"
              >
                อนุมัติแล้ว
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

        {/* Fuel Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีคำขอเบิกน้ำมัน</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีคำขอเบิกน้ำมัน'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow" style={{ paddingBottom: 0 }}>
                <CardContent className="p-0">
                  <div className="p-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {request.requestNo}
                        </h3>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {request.fuelType} - {request.tankerName}
                        </h4>
                      </div>
                      
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </Badge>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">จำนวนที่ขอ</Label>
                        <p className="text-sm text-gray-900">{request.quantityRequested.toLocaleString()} ลิตร</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">วันที่ขอ</Label>
                        <p className="text-sm text-gray-900">{formatDate(request.requestDate)}</p>
                      </div>
                      {request.approvedDate && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">วันที่อนุมัติ</Label>
                          <p className="text-sm text-gray-900">{formatDate(request.approvedDate)}</p>
                        </div>
                      )}
                      {request.remarks && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                          <p className="text-sm text-gray-900">{request.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Tabs - Bottom Section */}
                  <div className="border-t border-gray-200">
                    <div className="flex">
                      <Link href={`/fuel/requests/${request.id}`} className="flex-1">
                        <div className="p-4 text-center border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">ดูรายละเอียด</span>
                        </div>
                      </Link>
                      
                      {request.status === 'DRAFT' && (
                        <div 
                          onClick={() => handleSubmitRequest(request.id)}
                          className="flex-1 p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Send className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">ส่งคำขอ</span>
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
