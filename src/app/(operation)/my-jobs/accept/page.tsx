'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Camera, QrCode, Search, CheckCircle, Truck, Fuel, X, Scan, MapPin, Calendar, Clock, User } from 'lucide-react'
import jsQR from 'jsqr'
import { BrowserMultiFormatReader } from '@zxing/library'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AcceptJobPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { workPlans, createWorkLog } = useDataStore()
  const [workPlanId, setWorkPlanId] = useState('')
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!user || user.role !== 'WORKER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับพนักงานเท่านั้น</p>
        </div>
      </div>
    )
  }

  const handleQRScan = async () => {
    setIsScanning(true)
    
    try {
      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('กล้องไม่รองรับในเบราว์เซอร์นี้')
        setIsScanning(false)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })

      console.log('Camera access granted')

      // Create video element
      const video = document.createElement('video')
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      video.setAttribute('autoplay', 'true')
      video.setAttribute('muted', 'true')
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          resolve(true)
        }
      })

      console.log('Video ready, dimensions:', video.videoWidth, 'x', video.videoHeight)

      // Create scanner overlay
      const overlay = document.createElement('div')
      overlay.id = 'qr-scanner-overlay'
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `

      // Create video container
      const videoContainer = document.createElement('div')
      videoContainer.style.cssText = `
        position: relative;
        width: 90vw;
        max-width: 400px;
        height: 90vw;
        max-height: 400px;
        border: 3px solid #10b981;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
      `

      // Style video
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `

      // Create scan frame
      const scanFrame = document.createElement('div')
      scanFrame.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        border: 2px solid #10b981;
        border-radius: 8px;
        background: transparent;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
      `

      // Create close button
      const closeBtn = document.createElement('button')
      closeBtn.innerHTML = '✕'
      closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        font-size: 20px;
        cursor: pointer;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Create instruction text
      const instruction = document.createElement('div')
      instruction.innerHTML = 'วาง QR Code หรือ Barcode ของ Work Plan ในกรอบสีเขียว'
      instruction.style.cssText = `
        color: white;
        text-align: center;
        font-size: 18px;
        margin-top: 20px;
        padding: 0 20px;
        font-weight: 500;
      `

      // Create cancel button
      const cancelBtn = document.createElement('button')
      cancelBtn.innerHTML = 'ยกเลิก'
      cancelBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
        font-weight: 500;
      `

      // Assemble overlay
      videoContainer.appendChild(video)
      videoContainer.appendChild(scanFrame)
      videoContainer.appendChild(closeBtn)
      overlay.appendChild(videoContainer)
      overlay.appendChild(instruction)
      overlay.appendChild(cancelBtn)
      document.body.appendChild(overlay)

      // Create canvas for QR detection
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      let scanning = true
      let detectedCode = ''

      const scanQR = () => {
        if (!scanning || !video || !ctx) return
        
        try {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            // Try QR Code detection first
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
            
            // Debug: Log every 30 frames (about 1 second)
            if (Math.random() < 0.03) {
              console.log('Scanning... QR result:', qrCode ? 'Found' : 'Not found')
            }
            
            if (qrCode && qrCode.data && qrCode.data !== detectedCode) {
              console.log('QR Code detected:', qrCode.data)
              detectedCode = qrCode.data
              
              // Process detected code
              const planId = qrCode.data.trim()
              setWorkPlanId(planId)
              
              // Clean up
              scanning = false
              stream.getTracks().forEach(track => track.stop())
              document.body.removeChild(overlay)
              setIsScanning(false)
              
              // Auto search for work plan
              const workPlan = workPlans.find(plan => plan.id === planId)
              if (workPlan) {
                setSelectedWorkPlan(workPlan)
                alert(`สแกนสำเร็จ!\nWork Plan: ${planId}`)
              } else {
                alert(`ไม่พบ Work Plan: ${planId}`)
              }
              return
            }
            
            // Try 2D Barcode detection with ZXing (using data URL)
            try {
              const reader = new BrowserMultiFormatReader()
              // Convert video frame to data URL for barcode detection
              const tempCanvas = document.createElement('canvas')
              const tempCtx = tempCanvas.getContext('2d')
              if (tempCtx) {
                tempCanvas.width = video.videoWidth
                tempCanvas.height = video.videoHeight
                tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
                
                const dataURL = tempCanvas.toDataURL('image/png')
                reader.decodeFromImageUrl(dataURL).then(result => {
                  if (result && result.getText() && result.getText() !== detectedCode) {
                    console.log('Barcode detected:', result.getText())
                    detectedCode = result.getText()
                    
                    // Process detected code
                    const planId = result.getText().trim()
                    setWorkPlanId(planId)
                    
                    // Clean up
                    scanning = false
                    stream.getTracks().forEach(track => track.stop())
                    document.body.removeChild(overlay)
                    setIsScanning(false)
                    
                    // Auto search for work plan
                    const workPlan = workPlans.find(plan => plan.id === planId)
                    if (workPlan) {
                      setSelectedWorkPlan(workPlan)
                      alert(`สแกนสำเร็จ!\nWork Plan: ${planId}`)
                    } else {
                      alert(`ไม่พบ Work Plan: ${planId}`)
                    }
                  }
                }).catch(barcodeError => {
                  // Barcode not found, continue scanning
                  if (Math.random() < 0.01) {
                    console.log('Barcode scan attempt:', 'No barcode found')
                  }
                })
              }
            } catch (barcodeError) {
              // Barcode not found, continue scanning
              if (Math.random() < 0.01) {
                console.log('Barcode scan attempt:', 'No barcode found')
              }
            }
          }
        } catch (error) {
          console.warn('Scan error:', error)
        }
        
        if (scanning) {
          requestAnimationFrame(scanQR)
        }
      }

      // Start scanning after video is ready
      setTimeout(() => {
        scanQR()
      }, 1000)

      // Close button handler
      closeBtn.onclick = () => {
        scanning = false
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(overlay)
        setIsScanning(false)
      }

      // Cancel button handler
      cancelBtn.onclick = () => {
        scanning = false
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(overlay)
        setIsScanning(false)
      }

    } catch (error) {
      console.error('Camera error:', error)
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
      setIsScanning(false)
    }
  }

  const handleSearchWorkPlan = () => {
    if (!workPlanId.trim()) {
      alert('กรุณากรอก Work Plan ID')
      return
    }

    const workPlan = workPlans.find(plan => plan.id === workPlanId.trim())
    if (workPlan) {
      setSelectedWorkPlan(workPlan)
    } else {
      alert('ไม่พบ Work Plan ที่ระบุ')
    }
  }

  const handleAcceptJob = () => {
    if (!selectedWorkPlan) return

    setIsLoading(true)
    
    // Create new work log from work plan
    const newWorkLog = {
      id: `wl-${Date.now()}`,
      workPlanId: selectedWorkPlan.id,
      workPlanTitle: selectedWorkPlan.title,
      workerId: user.id,
      workerName: user.username,
      vehicleId: null,
      vehicleType: null,
      vehicleLicensePlate: null,
      status: 'PENDING' as const,
      assignedDate: new Date().toISOString(),
      startTime: null,
      endTime: null,
      startMileage: null,
      endMileage: null,
      startMileagePhoto: null,
      endMileagePhoto: null,
      workHours: 0,
      tasksCompleted: [],
      workResults: undefined,
      attachments: [],
      fuelBefore: undefined,
      fuelAfter: undefined,
      fuelUsed: undefined,
      fuelBeforePhoto: undefined,
      fuelAfterPhoto: undefined,
      fuelingRemarks: undefined,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to work logs
    createWorkLog(newWorkLog)

    setTimeout(() => {
      setIsLoading(false)
      alert(`รับงานเรียบร้อยแล้ว!\nงาน: ${selectedWorkPlan.title}`)
      router.push('/my-jobs')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">รับงานใหม่</h1>
          <div></div>
        </div>

        {/* QR Scan / Work Plan Input */}
        {!selectedWorkPlan && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>เลือก Work Plan</CardTitle>
              <CardDescription>สแกน QR Code/Barcode หรือกรอก Work Plan ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  สแกน QR Code หรือ Barcode ของ Work Plan
                </p>
                <Button 
                  onClick={handleQRScan}
                  disabled={isScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังสแกน...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      สแกน QR/Barcode
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-500 mb-4">หรือ</div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workPlanId" className="text-sm font-medium text-gray-700">Work Plan ID</Label>
                    <Input
                      id="workPlanId"
                      placeholder="เช่น wp-001"
                      value={workPlanId}
                      onChange={(e) => setWorkPlanId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleSearchWorkPlan}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    ค้นหา Work Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work Plan Details */}
        {selectedWorkPlan && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>รายละเอียดงาน</CardTitle>
                <CardDescription>ข้อมูลงานที่จะรับ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Work Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Work Plan ID</Label>
                    <p className="text-sm text-gray-900 font-mono">{selectedWorkPlan.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ชื่อแผนงาน</Label>
                    <p className="text-sm text-gray-900">{selectedWorkPlan.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">แปลง</Label>
                    <p className="text-sm text-gray-900">{selectedWorkPlan.plotName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">งานที่ได้รับมอบหมาย</Label>
                    <p className="text-sm text-gray-900">{selectedWorkPlan.task}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่เริ่มต้น</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedWorkPlan.startDate).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">วันที่สิ้นสุด</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedWorkPlan.endDate).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">สถานะ</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      รอการรับงาน
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {selectedWorkPlan.description && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedWorkPlan.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedWorkPlan(null)
                      setWorkPlanId('')
                    }}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={handleAcceptJob}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังรับงาน...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันรับงาน
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
