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
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CompleteWorkPage() {
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

  if (workLog.status !== 'IN_PROGRESS') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถจบงานได้</h2>
          <p className="mt-2 text-sm text-gray-600">งานนี้ไม่ได้อยู่ในสถานะกำลังดำเนินการ</p>
          <Link href={`/my-jobs/${logId}`}>
            <Button className="mt-4">กลับไปรายละเอียดงาน</Button>
          </Link>
        </div>
      </div>
    )
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
            <h3 class="text-lg font-semibold">ถ่ายรูปไมล์สิ้นสุด</h3>
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

  const handleCompleteWork = async () => {
    setIsLoading(true)
    
    // Mock OCR API call for end mileage reading
    const mockEndMileage = parseInt(workLog.startMileage?.toString() || '50000') + Math.floor(Math.random() * 100) + 10
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
            <Link href={`/my-jobs/${logId}`}>
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จบงาน</h1>
              <p className="text-sm text-gray-600">{workLog.workPlanTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="space-y-6">
          {/* Work Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">แผนงาน</Label>
                  <p className="text-sm text-gray-900">{workLog.workPlanTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">สถานะ</Label>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="h-4 w-4 mr-1" />
                    กำลังดำเนินการ
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">วันที่เริ่ม</Label>
                  <p className="text-sm text-gray-900">
                    {workLog.startTime ? new Date(workLog.startTime).toLocaleDateString('th-TH') : 'ยังไม่เริ่ม'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">ไมล์เริ่มต้น</Label>
                  <p className="text-sm text-gray-900">
                    {workLog.startMileage ? `${workLog.startMileage.toLocaleString()} กม.` : 'ยังไม่เริ่ม'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* End Work - Mileage Capture */}
          <Card>
            <CardHeader>
              <CardTitle>จบงาน - ถ่ายรูปไมล์</CardTitle>
              <CardDescription>
                ถ่ายรูปไมล์สิ้นสุดและกรอกผลงานที่ทำเสร็จ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show captured end mileage images if any */}
              {attachments.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">รูปภาพไมล์สิ้นสุด</Label>
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
                      ถ่ายรูปไมล์สิ้นสุดหรือกรอกเลขไมล์
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
                        ถ่ายรูปไมล์สิ้นสุด
                      </>
                    )}
                  </Button>
                  
                  <div className="text-sm text-gray-500">หรือ</div>
                  
                  <div>
                    <Label htmlFor="manualEndMileage">กรอกเลขไมล์สิ้นสุดด้วยตนเอง</Label>
                    <Input
                      id="manualEndMileage"
                      type="number"
                      placeholder="เช่น 50100"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Work Results Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">ผลงานที่ทำเสร็จ</Label>
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
                  </div>
                  
                  <Button 
                    onClick={handleCompleteWork}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังจบงาน...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันจบงาน
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
