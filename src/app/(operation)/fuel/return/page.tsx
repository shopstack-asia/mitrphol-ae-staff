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
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Package,
  Truck
} from 'lucide-react'
import Link from 'next/link'

export default function FuelReturnPage() {
  const { user } = useAuthStore()
  const { 
    fuelRequests, 
    fuelReturns, 
    equipments, 
    warehouses,
    getFuelRequestsByUser,
    getFuelReturnsByRequest,
    createFuelReturn,
    updateFuelReturn,
    calculateFuelUsage
  } = useFuelStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state for fuel return
  const [returnData, setReturnData] = useState({
    fuelRequestId: '',
    tankerVehicle: '',
    returnedQuantity: '',
    photoProof: '',
    receiver: '',
    remark: ''
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
  const completedRequests = userRequests.filter(req => req.status === 'COMPLETED')
  
  const filteredRequests = completedRequests.filter(request => {
    const matchesSearch = 
      request.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tankerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const userReturns = fuelReturns.filter(ret => ret.receiver === user.id)
  const filteredReturns = userReturns.filter(returnItem => {
    const matchesSearch = 
      returnItem.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.tankerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || returnItem.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'RECEIVED': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รอรับ'
      case 'RECEIVED': return 'รับแล้ว'
      case 'CONFIRMED': return 'ยืนยันแล้ว'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'RECEIVED': return <Package className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
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

  const handleCameraCapture = async () => {
    setIsCapturing(true)
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold">ถ่ายรูปหลักฐานการคืน</h3>
            <p class="text-sm text-gray-600">ถ่ายรูปน้ำมันที่คืน</p>
          </div>
          <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <video id="camera-video" class="w-full h-full object-cover" autoplay></video>
          </div>
          <div class="flex gap-2">
            <button id="capture-btn" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              ถ่ายรูป
            </button>
            <button id="cancel-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
              ยกเลิก
            </button>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      const videoElement = modal.querySelector('#camera-video') as HTMLVideoElement
      videoElement.srcObject = stream
      
      const captureBtn = modal.querySelector('#capture-btn')
      const cancelBtn = modal.querySelector('#cancel-btn')
      
      captureBtn?.addEventListener('click', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              setReturnData({...returnData, photoProof: url})
            }
          }, 'image/jpeg', 0.8)
        }
        
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
      cancelBtn?.addEventListener('click', () => {
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('ไม่สามารถเข้าถึงกล้องได้')
      setIsCapturing(false)
    }
  }

  const handleCreateReturn = async () => {
    if (!returnData.fuelRequestId || !returnData.tankerVehicle || !returnData.returnedQuantity) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setIsLoading(true)
    
    try {
      const request = userRequests.find(req => req.id === returnData.fuelRequestId)
      const tanker = equipments.find(eq => eq.id === returnData.tankerVehicle)
      const warehouse = warehouses[0] // Use first warehouse as default
      
      createFuelReturn({
        fuelRequestId: returnData.fuelRequestId,
        tankerVehicle: returnData.tankerVehicle,
        tankerName: tanker?.name || '',
        returnedQuantity: parseInt(returnData.returnedQuantity),
        photoProof: returnData.photoProof,
        receiver: warehouse.manager,
        receiverName: warehouse.managerName,
        remark: returnData.remark,
        status: 'PENDING',
        returnDate: new Date().toISOString()
      })

      // Reset form
      setReturnData({
        fuelRequestId: '',
        tankerVehicle: '',
        returnedQuantity: '',
        photoProof: '',
        receiver: '',
        remark: ''
      })
      
      setIsReturnDialogOpen(false)
      alert('สร้างการคืนน้ำมันเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error creating fuel return:', error)
      alert('เกิดข้อผิดพลาดในการสร้างการคืน')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmReturn = (returnId: string) => {
    updateFuelReturn(returnId, { 
      status: 'CONFIRMED',
      confirmedDate: new Date().toISOString()
    })
    alert('ยืนยันการคืนน้ำมันเรียบร้อยแล้ว')
  }

  const tankers = equipments.filter(eq => eq.type === 'Tanker')

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">คืนน้ำมัน</h1>
              <p className="text-sm text-gray-600">
                จัดการการคืนน้ำมันที่เหลือกลับคลังสินค้า
              </p>
            </div>
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  คืนน้ำมัน
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>คืนน้ำมัน</DialogTitle>
                  <DialogDescription>
                    บันทึกการคืนน้ำมันที่เหลือกลับคลังสินค้า
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="request">คำขอเบิกน้ำมัน</Label>
                    <Select value={returnData.fuelRequestId} onValueChange={(value) => setReturnData({...returnData, fuelRequestId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคำขอเบิกน้ำมัน" />
                      </SelectTrigger>
                      <SelectContent>
                        {completedRequests.map((request) => {
                          const fuelUsage = calculateFuelUsage(request.id)
                          return (
                            <SelectItem key={request.id} value={request.id}>
                              {request.requestNo} - เหลือ {fuelUsage.remaining}L
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tanker">รถบรรทุกน้ำมัน</Label>
                    <Select value={returnData.tankerVehicle} onValueChange={(value) => setReturnData({...returnData, tankerVehicle: value})}>
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
                    <Label htmlFor="quantity">จำนวนที่คืน (ลิตร)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={returnData.returnedQuantity}
                      onChange={(e) => setReturnData({...returnData, returnedQuantity: e.target.value})}
                      placeholder="เช่น 150"
                    />
                  </div>
                  
                  <div>
                    <Label>รูปหลักฐานการคืน</Label>
                    <div className="mt-1">
                      {returnData.photoProof ? (
                        <div className="relative">
                          <img src={returnData.photoProof} alt="Return Proof" className="w-full h-32 object-cover rounded border" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setReturnData({...returnData, photoProof: ''})}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleCameraCapture}
                          disabled={isCapturing}
                          className="w-full h-32"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          ถ่ายรูปหลักฐาน
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="remark">หมายเหตุ</Label>
                    <Textarea
                      id="remark"
                      value={returnData.remark}
                      onChange={(e) => setReturnData({...returnData, remark: e.target.value})}
                      placeholder="หมายเหตุเพิ่มเติม..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateReturn}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'กำลังบันทึก...' : 'บันทึกการคืน'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReturnDialogOpen(false)}
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
                  placeholder="ค้นหาการคืนน้ำมัน..."
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
                รอรับ
              </Button>
              <Button
                variant={statusFilter === 'RECEIVED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('RECEIVED')}
                size="sm"
              >
                รับแล้ว
              </Button>
              <Button
                variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('CONFIRMED')}
                size="sm"
              >
                ยืนยันแล้ว
              </Button>
            </div>
          </div>
        </div>

        {/* Fuel Returns List */}
        <div className="space-y-4">
          {filteredReturns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีการคืนน้ำมัน</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'ไม่พบการคืนที่ตรงกับเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีการคืนน้ำมัน'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReturns.map((returnItem) => (
              <Card key={returnItem.id} className="hover:shadow-md transition-shadow" style={{ paddingBottom: 0 }}>
                <CardContent className="p-0">
                  <div className="p-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {returnItem.returnNo}
                        </h3>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {returnItem.tankerName}
                        </h4>
                      </div>
                      
                      <Badge className={getStatusColor(returnItem.status)}>
                        {getStatusIcon(returnItem.status)}
                        <span className="ml-1">{getStatusText(returnItem.status)}</span>
                      </Badge>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">จำนวนที่คืน</Label>
                        <p className="text-sm text-gray-900">{returnItem.returnedQuantity.toLocaleString()} ลิตร</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">วันที่คืน</Label>
                        <p className="text-sm text-gray-900">{formatDate(returnItem.returnDate)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">ผู้รับ</Label>
                        <p className="text-sm text-gray-900">{returnItem.receiverName}</p>
                      </div>
                      {returnItem.receivedDate && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">วันที่รับ</Label>
                          <p className="text-sm text-gray-900">{formatDate(returnItem.receivedDate)}</p>
                        </div>
                      )}
                      {returnItem.remark && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                          <p className="text-sm text-gray-900">{returnItem.remark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Tabs - Bottom Section */}
                  <div className="border-t border-gray-200">
                    <div className="flex">
                      <div className="flex-1 p-4 text-center">
                        <span className="text-sm font-medium text-gray-700">รายละเอียดการคืน</span>
                      </div>
                      
                      {returnItem.status === 'RECEIVED' && (
                        <div 
                          onClick={() => handleConfirmReturn(returnItem.id)}
                          className="flex-1 p-4 text-center hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">ยืนยันการคืน</span>
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
