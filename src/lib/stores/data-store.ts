import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Import mock data
import usersData from '@/mock/users.json'
import workRequestsData from '@/mock/work_requests.json'
import workPlansData from '@/mock/work_plans.json'
import workLogsData from '@/mock/work_logs.json'
import payoutsData from '@/mock/payouts.json'
import payoutItemsData from '@/mock/payout_items.json'

export interface WorkRequest {
  id: string
  requestNo: string
  customerId: string
  customerName: string
  plotId: string
  plotName: string
  plotLocation: string
  plotSize: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'WAITING_APPROVAL'
  assignedTo: string
  assignedToName: string
  requestedDate: string
  dueDate: string
  activities: Array<{
    id: string
    name: string
    description: string
    isRequired: boolean
    completed: boolean
  }>
  notes: string
  attachments: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  createdAt: string
  updatedAt: string
}

export interface WorkPlan {
  id: string
  workOrderNo: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'WAITING_APPROVAL'
  supervisorId: string
  supervisorName: string
  assignedDate: string
  startDate: string
  endDate: string
  requiredPersonnel: number
  currentWorkers: number
  maxWorkers: number
  workLocation: string
  tasks: Array<{
    id: string
    name: string
    description: string
    estimatedHours: number
    requiredSkills: string[]
  }>
  vehicles: Array<{
    id: string
    type: string
    licensePlate: string
    assignedTo: string | null
  }>
  joinedWorkers: Array<{
    id: string
    name: string
    joinedAt: string
    vehicleId: string | null
  }>
  qrCode: string
  createdAt: string
  updatedAt: string
}

export interface WorkLog {
  id: string
  workPlanId: string
  workPlanTitle: string
  workerId: string
  workerName: string
  vehicleId: string | null
  vehicleType: string | null
  vehicleLicensePlate: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'WAITING_APPROVAL'
  assignedDate: string
  startTime: string | null
  endTime: string | null
  startMileage: number | null
  endMileage: number | null
  startMileagePhoto: string | null
  endMileagePhoto: string | null
  workHours: number
  tasksCompleted: Array<{
    id: string
    name: string
    completedAt: string
  }>
  workResults?: {
    completedArea: string
    completedTrees: string
    completedTasks: string
    notes: string
  }
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  fuelBefore?: number
  fuelAfter?: number
  fuelUsed?: number
  fuelBeforePhoto?: string
  fuelAfterPhoto?: string
  fuelingRemarks?: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Payout {
  id: string
  period: string
  periodName: string
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  totalAmount: number
  baseAmount: number
  incentiveAmount: number
  deductionAmount: number
  taxAmount: number
  netAmount: number
  workerId: string
  workerName: string
  workLogs: Array<{
    id: string
    workPlanTitle: string
    workHours: number
    baseRate: number
    baseAmount: number
    incentiveRate: number
    incentiveAmount: number
  }>
  paidAt?: string
  createdAt: string
  updatedAt: string
}

interface DataState {
  workRequests: WorkRequest[]
  workPlans: WorkPlan[]
  workLogs: WorkLog[]
  payouts: Payout[]
  
  // Actions
  updateWorkRequest: (id: string, updates: Partial<WorkRequest>) => void
  updateWorkPlan: (id: string, updates: Partial<WorkPlan>) => void
  updateWorkLog: (id: string, updates: Partial<WorkLog>) => void
  addWorkLog: (workLog: WorkLog) => void
  createWorkLog: (workLog: WorkLog) => void
  getWorkRequestsByUser: (userId: string) => WorkRequest[]
  getWorkPlansByUser: (userId: string) => WorkPlan[]
  getWorkLogsByUser: (userId: string) => WorkLog[]
  getPayoutsByUser: (userId: string) => Payout[]
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      workRequests: workRequestsData as WorkRequest[],
      workPlans: workPlansData as WorkPlan[],
      workLogs: workLogsData as WorkLog[],
      payouts: payoutsData as Payout[],

      updateWorkRequest: (id: string, updates: Partial<WorkRequest>) => {
        set((state) => ({
          workRequests: state.workRequests.map((wr) =>
            wr.id === id ? { ...wr, ...updates, updatedAt: new Date().toISOString() } : wr
          ),
        }))
      },

      updateWorkPlan: (id: string, updates: Partial<WorkPlan>) => {
        set((state) => ({
          workPlans: state.workPlans.map((wp) =>
            wp.id === id ? { ...wp, ...updates, updatedAt: new Date().toISOString() } : wp
          ),
        }))
      },

      updateWorkLog: (id: string, updates: Partial<WorkLog>) => {
        set((state) => ({
          workLogs: state.workLogs.map((wl) =>
            wl.id === id ? { ...wl, ...updates, updatedAt: new Date().toISOString() } : wl
          ),
        }))
      },

      addWorkLog: (workLog: WorkLog) => {
        set((state) => ({
          workLogs: [...state.workLogs, workLog],
        }))
      },

      createWorkLog: (workLog: WorkLog) => {
        set((state) => ({
          workLogs: [...state.workLogs, workLog],
        }))
      },

      getWorkRequestsByUser: (userId: string) => {
        return get().workRequests.filter((wr) => wr.assignedTo === userId)
      },

      getWorkPlansByUser: (userId: string) => {
        return get().workPlans.filter((wp) => wp.supervisorId === userId)
      },

      getWorkLogsByUser: (userId: string) => {
        return get().workLogs.filter((wl) => wl.workerId === userId)
      },

      getPayoutsByUser: (userId: string) => {
        return get().payouts.filter((p) => p.workerId === userId)
      },
    }),
    {
      name: 'data-storage',
    }
  )
)
