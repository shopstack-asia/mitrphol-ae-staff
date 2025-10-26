import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Import mock data
import fuelRequestsData from '@/mock/fuel_requests.json'
import fuelTransactionsData from '@/mock/fuel_transactions.json'
import fuelReturnsData from '@/mock/fuel_returns.json'
import fuelTypesData from '@/mock/fuel_types.json'
import equipmentsData from '@/mock/equipments.json'
import warehousesData from '@/mock/warehouses.json'

// Type definitions
export interface FuelRequest {
  id: string
  requestNo: string
  requestDate: string
  requestedBy: string
  requestedByName: string
  fuelType: string
  quantityRequested: number
  assignedTanker: string
  tankerName: string
  status: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  approvedBy?: string
  approvedDate?: string
  completedDate?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface FuelTransaction {
  id: string
  txnNo: string
  fuelRequestId: string
  equipmentId: string
  equipmentName: string
  equipmentType: string
  fuelType: string
  amountDispensed: number
  gaugeBefore: string
  gaugeAfter: string
  dateTime: string
  location: {
    lat: number
    lng: number
    address: string
  }
  attendantId: string
  attendantName: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface FuelReturn {
  id: string
  returnNo: string
  fuelRequestId: string
  tankerVehicle: string
  tankerName: string
  returnedQuantity: number
  photoProof?: string
  receiver: string
  receiverName: string
  remark?: string
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED'
  returnDate: string
  receivedDate?: string
  confirmedDate?: string
  createdAt: string
  updatedAt: string
}

export interface FuelType {
  id: string
  name: string
  nameThai: string
  unit: string
  pricePerLitre: number
  description: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  licensePlate: string
  fuelType: string
  tankCapacity: number
  currentFuelLevel: number
  location: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  assignedTo?: string
  assignedToName?: string
}

export interface Warehouse {
  id: string
  name: string
  nameEnglish: string
  location: {
    lat: number
    lng: number
    address: string
  }
  fuelTypes: string[]
  storageCapacity: Record<string, number>
  currentStock: Record<string, number>
  manager: string
  managerName: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface FuelStore {
  // Data
  fuelRequests: FuelRequest[]
  fuelTransactions: FuelTransaction[]
  fuelReturns: FuelReturn[]
  fuelTypes: FuelType[]
  equipments: Equipment[]
  warehouses: Warehouse[]
  
  // Actions
  getFuelRequestsByUser: (userId: string) => FuelRequest[]
  getFuelTransactionsByRequest: (requestId: string) => FuelTransaction[]
  getFuelReturnsByRequest: (requestId: string) => FuelReturn[]
  getEquipmentById: (equipmentId: string) => Equipment | undefined
  getWarehouseById: (warehouseId: string) => Warehouse | undefined
  
  // CRUD Operations
  createFuelRequest: (request: Omit<FuelRequest, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'>) => FuelRequest
  updateFuelRequest: (id: string, updates: Partial<FuelRequest>) => void
  createFuelTransaction: (transaction: Omit<FuelTransaction, 'id' | 'txnNo' | 'createdAt' | 'updatedAt'>) => FuelTransaction
  createFuelReturn: (returnData: Omit<FuelReturn, 'id' | 'returnNo' | 'createdAt' | 'updatedAt'>) => FuelReturn
  updateFuelReturn: (id: string, updates: Partial<FuelReturn>) => void
  
  // Utility functions
  generateRequestNo: () => string
  generateTransactionNo: () => string
  generateReturnNo: () => string
  calculateFuelUsage: (requestId: string) => { used: number; remaining: number }
}

export const useFuelStore = create<FuelStore>()(
  persist(
    (set, get) => ({
      // Initial data
      fuelRequests: fuelRequestsData as FuelRequest[],
      fuelTransactions: fuelTransactionsData as FuelTransaction[],
      fuelReturns: fuelReturnsData as FuelReturn[],
      fuelTypes: fuelTypesData as FuelType[],
      equipments: equipmentsData as Equipment[],
      warehouses: warehousesData as Warehouse[],

      // Getters
      getFuelRequestsByUser: (userId: string) => {
        return get().fuelRequests.filter(req => req.requestedBy === userId)
      },

      getFuelTransactionsByRequest: (requestId: string) => {
        return get().fuelTransactions.filter(txn => txn.fuelRequestId === requestId)
      },

      getFuelReturnsByRequest: (requestId: string) => {
        return get().fuelReturns.filter(ret => ret.fuelRequestId === requestId)
      },

      getEquipmentById: (equipmentId: string) => {
        return get().equipments.find(eq => eq.id === equipmentId)
      },

      getWarehouseById: (warehouseId: string) => {
        return get().warehouses.find(wh => wh.id === warehouseId)
      },

      // CRUD Operations
      createFuelRequest: (requestData) => {
        const newRequest: FuelRequest = {
          ...requestData,
          id: `fr-${Date.now()}`,
          requestNo: get().generateRequestNo(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          fuelRequests: [...state.fuelRequests, newRequest]
        }))
        
        return newRequest
      },

      updateFuelRequest: (id, updates) => {
        set(state => ({
          fuelRequests: state.fuelRequests.map(req => 
            req.id === id 
              ? { ...req, ...updates, updatedAt: new Date().toISOString() }
              : req
          )
        }))
      },

      createFuelTransaction: (transactionData) => {
        const newTransaction: FuelTransaction = {
          ...transactionData,
          id: `ftx-${Date.now()}`,
          txnNo: get().generateTransactionNo(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          fuelTransactions: [...state.fuelTransactions, newTransaction]
        }))
        
        return newTransaction
      },

      createFuelReturn: (returnData) => {
        const newReturn: FuelReturn = {
          ...returnData,
          id: `frt-${Date.now()}`,
          returnNo: get().generateReturnNo(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          fuelReturns: [...state.fuelReturns, newReturn]
        }))
        
        return newReturn
      },

      updateFuelReturn: (id, updates) => {
        set(state => ({
          fuelReturns: state.fuelReturns.map(ret => 
            ret.id === id 
              ? { ...ret, ...updates, updatedAt: new Date().toISOString() }
              : ret
          )
        }))
      },

      // Utility functions
      generateRequestNo: () => {
        const year = new Date().getFullYear()
        const requests = get().fuelRequests.filter(req => req.requestNo.includes(year.toString()))
        const nextNumber = requests.length + 1
        return `FR-${year}-${nextNumber.toString().padStart(3, '0')}`
      },

      generateTransactionNo: () => {
        const year = new Date().getFullYear()
        const transactions = get().fuelTransactions.filter(txn => txn.txnNo.includes(year.toString()))
        const nextNumber = transactions.length + 1
        return `FTX-${year}-${nextNumber.toString().padStart(5, '0')}`
      },

      generateReturnNo: () => {
        const year = new Date().getFullYear()
        const returns = get().fuelReturns.filter(ret => ret.returnNo.includes(year.toString()))
        const nextNumber = returns.length + 1
        return `FRT-${year}-${nextNumber.toString().padStart(3, '0')}`
      },

      calculateFuelUsage: (requestId: string) => {
        const request = get().fuelRequests.find(req => req.id === requestId)
        if (!request) return { used: 0, remaining: 0 }

        const transactions = get().getFuelTransactionsByRequest(requestId)
        const returns = get().getFuelReturnsByRequest(requestId)

        const used = transactions.reduce((sum, txn) => sum + txn.amountDispensed, 0)
        const returned = returns.reduce((sum, ret) => sum + ret.returnedQuantity, 0)
        const remaining = request.quantityRequested - used - returned

        return { used, remaining }
      }
    }),
    {
      name: 'fuel-store',
      partialize: (state) => ({
        fuelRequests: state.fuelRequests,
        fuelTransactions: state.fuelTransactions,
        fuelReturns: state.fuelReturns
      })
    }
  )
)
