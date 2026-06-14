export interface House {
  id: string
  name: string
  address: string
  inviteCode: string
  rules: string[]
  ownerId: string
  commonFund: number
}

export interface Member {
  id: string
  houseId: string
  name: string
  avatar: string
  role: 'owner' | 'member'
}

export interface ChoreSchedule {
  id: string
  houseId: string
  memberId: string
  date: string
  choreType: string
  completed: boolean
}

export interface ChoreCheckin {
  id: string
  scheduleId: string
  memberId: string
  photoUrl: string
  completedAt: string
}

export interface ShiftRequest {
  id: string
  houseId: string
  requesterId: string
  targetId: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ShoppingItem {
  id: string
  houseId: string
  name: string
  addedBy: string
  urgency: 'low' | 'medium' | 'high'
  purchased: boolean
  purchasedBy?: string
  price?: number
  photoUrl?: string
}

export interface Expense {
  id: string
  houseId: string
  payerId: string
  amount: number
  category: string
  splitType: 'equal' | 'custom'
  description: string
  createdAt: string
  settled: boolean
  splits: { memberId: string; amount: number; paid: boolean }[]
}

export interface FridgeItem {
  id: string
  houseId: string
  name: string
  ownerId: string
  ownership: 'shared' | 'personal'
  expiryDate?: string
  category: string
  borrowed: boolean
  borrowedBy?: string
  borrowReturnDate?: string
}

export interface Vote {
  id: string
  houseId: string
  createdBy: string
  title: string
  type: 'quiet_hours' | 'general'
  options: { label: string; votes: string[] }[]
  deadline: string
  anonymous: boolean
  status: 'active' | 'closed'
}

export interface Visitor {
  id: string
  houseId: string
  hostId: string
  visitorName: string
  relation: string
  visitDate: string
  leaveDate?: string
  status: 'upcoming' | 'visiting' | 'left'
}

export interface ChatMessage {
  id: string
  houseId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'system'
  createdAt: string
}

export interface Announcement {
  id: string
  houseId: string
  authorId: string
  content: string
  createdAt: string
  readBy: string[]
}

export interface ActivityItem {
  id: string
  houseId: string
  memberId: string
  action: string
  detail: string
  createdAt: string
}
