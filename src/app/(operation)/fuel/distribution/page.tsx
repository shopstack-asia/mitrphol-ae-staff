'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Fuel,
  Truck,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function FuelDistributionPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    fuelRequests, 
    fuelTransactions, 
    equipments, 
    getFuelRequestsByUser,
    getFuelTransactionsByRequest,
    createFuelTransaction,
    calculateFuelUsage
  } = useFuelStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [isFuelingDialogOpen, setIsFuelingDialogOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state for fueling transaction
  const [fuelingData, setFuelingData] = useState({
    equipmentId: '',
    amountDispensed: '',
    remarks: '',
    gaugeBefore: '',
    gaugeAfter: ''
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
  const activeRequests = userRequests.filter(req => req.status === 'APPROVED')
  
  const filteredRequests = activeRequests.filter(request => {
    const matchesSearch = 
      request.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tankerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const selectedRequest = activeRequests.find(req => req.id === selectedRequestId) || activeRequests[0]
  const transactions = selectedRequest ? getFuelTransactionsByRequest(selectedRequest.id) : []
  const fuelUsage = selectedRequest ? calculateFuelUsage(selectedRequest.id) : { used: 0, remaining: 0 }

  const targetEquipments = equipments.filter(eq => 
    eq.type !== 'Tanker' && 
    eq.fuelType === selectedRequest?.fuelType &&
    eq.status === 'ACTIVE'
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCameraCapture = async (type: 'before' | 'after') => {
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
            <h3 class="text-lg font-semibold">ถ่ายรูป${type === 'before' ? 'ก่อนเติม' : 'หลังเติม'}</h3>
            <p class="text-sm text-gray-600">จัดตำแหน่งและคลิกถ่าย</p>
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
              const fileName = `gauge_${type}_${Date.now()}.jpg`
              
              if (type === 'before') {
                setFuelingData({...fuelingData, gaugeBefore: url})
              } else {
                setFuelingData({...fuelingData, gaugeAfter: url})
              }
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

  const handleFuelingTransaction = async () => {
    if (!fuelingData.equipmentId || !fuelingData.amountDispensed) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (!selectedRequest) {
      alert('กรุณาเลือกคำขอเบิกน้ำมัน')
      return
    }

    setIsLoading(true)
    
    try {
      const equipment = equipments.find(eq => eq.id === fuelingData.equipmentId)
      
      createFuelTransaction({
        fuelRequestId: selectedRequest.id,
        equipmentId: fuelingData.equipmentId,
        equipmentName: equipment?.name || '',
        equipmentType: equipment?.type || '',
        fuelType: selectedRequest.fuelType,
        amountDispensed: parseInt(fuelingData.amountDispensed),
        gaugeBefore: fuelingData.gaugeBefore,
        gaugeAfter: fuelingData.gaugeAfter,
        dateTime: new Date().toISOString(),
        location: {
          lat: 14.981,
          lng: 100.512,
          address: equipment?.location || 'แปลงงาน'
        },
        attendantId: user.id,
        attendantName: `${user.firstName} ${user.lastName}`,
        remarks: fuelingData.remarks
      })

      // Reset form
      setFuelingData({
        equipmentId: '',
        amountDispensed: '',
        remarks: '',
        gaugeBefore: '',
        gaugeAfter: ''
      })
      
      setIsFuelingDialogOpen(false)
      alert('บันทึกการเติมน้ำมันเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error creating fuel transaction:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">การแจกจ่ายน้ำมัน</h1>
              <p className="text-sm text-gray-600">
                ติดตามการเติมน้ำมันและจัดการการแจกจ่าย
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Add Fuel Button */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/fuel/distribution/fill')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            เติมน้ำมัน
          </Button>
        </div>

        {/* Request Selection */}
        {/* {activeRequests.length > 0 && (
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">เลือกคำขอเบิกน้ำมัน</Label>
            <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกคำขอเบิกน้ำมัน" />
              </SelectTrigger>
              <SelectContent>
                {activeRequests.map((request) => (
                  <SelectItem key={request.id} value={request.id}>
                    {request.requestNo} - {request.fuelType} ({request.quantityRequested}L)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )} */}

        {selectedRequest && (
          <>
            {/* Fuel Inventory Status */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    สถานะน้ำมันในรถบรรทุก
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">น้ำมันที่ขอ</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedRequest.quantityRequested.toLocaleString()} ลิตร
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">น้ำมันที่ใช้แล้ว</p>
                      <p className="text-2xl font-bold text-green-600">
                        {fuelUsage.used.toLocaleString()} ลิตร
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Fuel className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">น้ำมันที่เหลือ</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {fuelUsage.remaining.toLocaleString()} ลิตร
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">รายการเติมน้ำมัน</h3>
              
              {transactions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Fuel className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">ยังไม่มีการเติมน้ำมัน</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      เริ่มต้นการเติมน้ำมันโดยคลิกปุ่ม "เติมน้ำมัน"
                    </p>
                  </CardContent>
                </Card>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {transaction.equipmentName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {transaction.equipmentType} - {transaction.fuelType}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          เสร็จสิ้น
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">จำนวนที่เติม</Label>
                          <p className="text-sm text-gray-900">{transaction.amountDispensed} ลิตร</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">วันที่เติม</Label>
                          <p className="text-sm text-gray-900">{formatDate(transaction.dateTime)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">ตำแหน่ง</Label>
                          <p className="text-sm text-gray-900">{transaction.location.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">พนักงานเติม</Label>
                          <p className="text-sm text-gray-900">{transaction.attendantName}</p>
                        </div>
                      </div>
                      
                      {transaction.remarks && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                          <p className="text-sm text-gray-900">{transaction.remarks}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {activeRequests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีคำขอที่อนุมัติแล้ว</h3>
              <p className="mt-2 text-sm text-gray-600">
                กรุณาสร้างคำขอเบิกน้ำมันและรอการอนุมัติก่อน
              </p>
              <Link href="/fuel/requests">
                <Button className="mt-4">
                  ไปที่คำขอเบิกน้ำมัน
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
