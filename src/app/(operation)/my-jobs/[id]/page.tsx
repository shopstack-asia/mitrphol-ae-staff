'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Car,
  User,
  Save,
  Send,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function WorkLogDetailPage() {
  const { user } = useAuthStore()
  const { workLogs, updateWorkLog } = useDataStore()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [attachments, setAttachments] = useState<Array<{
    id: string
    name: string
    type: string
    url: string
    file?: File
  }>>([])
  const [workResults, setWorkResults] = useState({
    completedArea: '',
    completedTrees: '',
    completedTasks: '',
    notes: ''
  })
  const [startMileage, setStartMileage] = useState('')
  const [endMileage, setEndMileage] = useState('')

  const logId = params.id as string
  const workLog = workLogs.find(wl => wl.id === logId)

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

  if (!workLog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบงาน</h2>
          <p className="mt-2 text-sm text-gray-600">งานที่คุณกำลังมองหาไม่มีอยู่</p>
          <Link href="/my-jobs">
            <Button className="mt-4">กลับไปรายการงาน</Button>
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
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          file: file
        }
        setAttachments(prev => [...prev, newAttachment])
      })
    }
  }

  const handleCameraCapture = async () => {
    setIsCapturing(true)
    console.log('Starting camera capture...')
    
    try {
      // ตรวจสอบ browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }
      
      console.log('Requesting camera access...')
      // เปิดกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // ใช้กล้องหลัง
      })
      console.log('Camera access granted:', stream)
      
      // สร้าง modal สำหรับถ่ายรูป
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold">ถ่ายรูป</h3>
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
      
      // ตั้งค่า video
      const videoElement = modal.querySelector('#camera-video') as HTMLVideoElement
      videoElement.srcObject = stream
      
      // จัดการ events
      const captureBtn = modal.querySelector('#capture-btn')
      const cancelBtn = modal.querySelector('#cancel-btn')
      
      captureBtn?.addEventListener('click', () => {
        console.log('Capture button clicked')
        
        // สร้าง canvas เพื่อจับภาพ
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        console.log('Canvas size:', canvas.width, 'x', canvas.height)
        
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0)
          console.log('Image drawn to canvas')
          
          // แปลงเป็น blob
          canvas.toBlob((blob) => {
            console.log('Canvas toBlob result:', blob)
            if (blob) {
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
              const url = URL.createObjectURL(blob)
              
              console.log('Created attachment:', { file, url })
              
              const newAttachment = {
                id: Date.now().toString(),
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
                url: url,
                file: file
              }
              
              console.log('Adding attachment:', newAttachment)
              setAttachments(prev => {
                // สำหรับการถ่ายรูปไมล์ ให้เก็บแค่รูปเดียว (รูปล่าสุด)
                const newAttachments = [newAttachment] // ลบรูปเก่าทั้งหมด เก็บแค่รูปใหม่
                console.log('Updated attachments (mileage photo):', newAttachments)
                return newAttachments
              })
            } else {
              console.error('Failed to create blob from canvas')
            }
          }, 'image/jpeg', 0.8)
        } else {
          console.error('Failed to get canvas context')
        }
        
        // ปิดกล้องและ modal
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
      cancelBtn?.addEventListener('click', () => {
        // ปิดกล้องและ modal
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      
      let errorMessage = 'ไม่สามารถเข้าถึงกล้องได้'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'กรุณาอนุญาตการเข้าถึงกล้อง'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'ไม่พบกล้องในอุปกรณ์'
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง'
        } else if (error.name === 'SecurityError') {
          errorMessage = 'ต้องใช้ HTTPS เพื่อเข้าถึงกล้อง'
        }
      }
      
      alert(errorMessage)
      setIsCapturing(false)
    }
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleStartWork = async () => {
    setIsLoading(true)
    
    // Mock OCR API call for mileage reading
    const mockMileage = Math.floor(Math.random() * 100000) + 50000
    setStartMileage(mockMileage.toString())
    
    updateWorkLog(logId, { 
      status: 'IN_PROGRESS',
      startTime: new Date().toISOString(),
      startMileage: mockMileage
    })
    
    setTimeout(() => {
      setIsLoading(false)
      alert(`เริ่มงานแล้ว! ไมล์เริ่มต้น: ${mockMileage.toLocaleString()} กม.`)
    }, 1000)
  }

  const handleCompleteWork = async () => {
    setIsLoading(true)
    
    // Mock OCR API call for end mileage reading
    const mockEndMileage = parseInt(startMileage) + Math.floor(Math.random() * 100) + 10
    setEndMileage(mockEndMileage.toString())
    
    updateWorkLog(logId, { 
      status: 'COMPLETED',
      endTime: new Date().toISOString(),
      endMileage: mockEndMileage,
      workResults: workResults,
      attachments: attachments
    })
    
    setTimeout(() => {
      setIsLoading(false)
      alert(`จบงานแล้ว! ไมล์สิ้นสุด: ${mockEndMileage.toLocaleString()} กม.`)
      router.push('/my-jobs')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/my-jobs">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workLog.workPlanTitle}</h1>
              <p className="text-sm text-gray-600">รายละเอียดงาน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Log Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ข้อมูลงาน</CardTitle>
                  <Badge className={getStatusColor(workLog.status)}>
                    {getStatusIcon(workLog.status)}
                    <span className="ml-1">{getStatusText(workLog.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">แผนงาน</Label>
                    <p className="text-sm text-gray-900">{workLog.workPlanTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">สถานะ</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(workLog.status)}>
                        {getStatusIcon(workLog.status)}
                        <span className="ml-1">{getStatusText(workLog.status)}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่เริ่ม</Label>
                    <p className="text-sm text-gray-900">
                      {workLog.startTime ? formatDate(workLog.startTime) : 'ยังไม่เริ่ม'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่สิ้นสุด</Label>
                    <p className="text-sm text-gray-900">
                      {workLog.endTime ? formatDate(workLog.endTime) : 'ยังไม่เสร็จ'}
                    </p>
                  </div>
                </div>
                
                {workLog.vehicleType && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ยานพาหนะ</Label>
                    <p className="text-sm text-gray-900">
                      {workLog.vehicleType} {workLog.vehicleLicensePlate}
                    </p>
                  </div>
                )}
                
                {workLog.workHours > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ชั่วโมงทำงาน</Label>
                    <p className="text-sm text-gray-900">{workLog.workHours} ชั่วโมง</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Start Work - Mileage Capture */}
            {workLog.status === 'PENDING' && (
              <Card>
                <CardHeader>
                  <CardTitle>เริ่มงาน - ถ่ายรูปไมล์</CardTitle>
                  <CardDescription>
                    ถ่ายรูปไมล์เริ่มต้นหรือกรอกเลขไมล์
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show captured images if any */}
                  {attachments.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">รูปภาพที่ถ่าย</Label>
                      <div className="space-y-4">
                        {attachments.map((attachment) => (
                          <div key={attachment.id} className="relative group">
                            {attachment.type.startsWith('image/') ? (
                              <div className="w-full rounded-lg overflow-hidden border">
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-50">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveAttachment(attachment.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 truncate">{attachment.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center py-8">
                    {/* Show large camera icon only when no photos taken */}
                    {attachments.length === 0 && (
                      <>
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          ถ่ายรูปไมล์เริ่มต้นหรือกรอกเลขไมล์
                        </p>
                      </>
                    )}
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={handleCameraCapture}
                        disabled={isCapturing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isCapturing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            กำลังถ่ายรูป...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            ถ่ายรูปไมล์
                          </>
                        )}
                      </Button>
                      
                      <div className="text-sm text-gray-500">หรือ</div>
                      
                      <div>
                        <Label htmlFor="manualMileage">กรอกเลขไมล์ด้วยตนเอง</Label>
                        <Input
                          id="manualMileage"
                          type="number"
                          placeholder="เช่น 50000"
                          className="mt-1"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleStartWork}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันเริ่มงาน
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Results - Only show when COMPLETED */}
            {workLog.status === 'COMPLETED' && (
              <Card>
                <CardHeader>
                  <CardTitle>ผลงานที่ทำเสร็จ</CardTitle>
                  <CardDescription>
                    บันทึกผลงานที่ทำเสร็จ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="completedArea">พื้นที่ที่ทำเสร็จ (ไร่)</Label>
                      <Input
                        id="completedArea"
                        value={workResults.completedArea}
                        onChange={(e) => setWorkResults({...workResults, completedArea: e.target.value})}
                        placeholder="เช่น 15.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="completedTrees">จำนวนต้นที่ทำเสร็จ</Label>
                      <Input
                        id="completedTrees"
                        value={workResults.completedTrees}
                        onChange={(e) => setWorkResults({...workResults, completedTrees: e.target.value})}
                        placeholder="เช่น 150"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="completedTasks">งานที่ทำเสร็จ</Label>
                    <Input
                      id="completedTasks"
                      value={workResults.completedTasks}
                      onChange={(e) => setWorkResults({...workResults, completedTasks: e.target.value})}
                      placeholder="เช่น ปลูก, ใส่ปุ๋ย, ฉีดยา"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                      id="notes"
                      value={workResults.notes}
                      onChange={(e) => setWorkResults({...workResults, notes: e.target.value})}
                      placeholder="หมายเหตุเพิ่มเติม..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mileage Information - Show when started */}
            {workLog.status !== 'PENDING' && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลไมล์</CardTitle>
                  <CardDescription>
                    ไมล์เริ่มต้นและสิ้นสุด (อ่านจากรูปภาพ)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">ไมล์เริ่มต้น</p>
                      <p className="text-2xl font-bold text-green-600">
                        {startMileage ? `${parseInt(startMileage).toLocaleString()} กม.` : 'ยังไม่เริ่ม'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">ไมล์สิ้นสุด</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {endMileage ? `${parseInt(endMileage).toLocaleString()} กม.` : 'ยังไม่จบ'}
                      </p>
                    </div>
                  </div>
                  
                  {startMileage && endMileage && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">ระยะทางที่ใช้</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(parseInt(endMileage) - parseInt(startMileage)).toLocaleString()} กม.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


            {/* Work Photos - Show when IN_PROGRESS or COMPLETED */}
            {(workLog.status === 'IN_PROGRESS' || workLog.status === 'COMPLETED') && (
              <Card>
                <CardHeader>
                  <CardTitle>รูปภาพระหว่างปฏิบัติงาน</CardTitle>
                  <CardDescription>
                    ถ่ายรูประหว่างปฏิบัติงานเก็บไว้
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Attachments */}
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="relative group">
                        {attachment.type.startsWith('image/') ? (
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-50">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{attachment.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">ยังไม่มีรูปภาพ</p>
                  </div>
                )}
                
                {/* Upload Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCameraCapture}
                    disabled={isCapturing}
                    className="flex-1"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        กำลังถ่ายรูป...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        ถ่ายรูป
                      </>
                    )}
                  </Button>
                  
                  <label className="flex-1">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        เลือกไฟล์
                      </span>
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {workLog.status !== 'PENDING' && (
              <Card>
                <CardHeader>
                  <CardTitle>การดำเนินการ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workLog.status === 'IN_PROGRESS' && (
                    <Link href={`/my-jobs/${logId}/complete`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        จบงาน
                      </Button>
                    </Link>
                  )}
                  
                  {workLog.status === 'COMPLETED' && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">งานเสร็จสิ้นแล้ว</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Work Summary - Only show when COMPLETED */}
            {workLog.status === 'COMPLETED' && (
              <Card>
                <CardHeader>
                  <CardTitle>สรุปงาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>สถานะ</span>
                    <Badge className={getStatusColor(workLog.status)}>
                      {getStatusText(workLog.status)}
                    </Badge>
                  </div>
                  
                  {workLog.workHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>ชั่วโมงทำงาน</span>
                      <span className="font-medium">{workLog.workHours} ชั่วโมง</span>
                    </div>
                  )}
                  
                  {workLog.vehicleType && (
                    <div className="flex justify-between text-sm">
                      <span>ยานพาหนะ</span>
                      <span className="font-medium">{workLog.vehicleType}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>รูปภาพ</span>
                    <span className="font-medium">{attachments.length} รูป</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
