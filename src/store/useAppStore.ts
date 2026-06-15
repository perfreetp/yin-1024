import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type {
  House, Member, ChoreSchedule, ChoreCheckin, ShiftRequest,
  ShoppingItem, Expense, FridgeItem, Vote, Visitor,
  ChatMessage, Announcement, ActivityItem
} from '@/types'

function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function genInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const EMPTY_HOUSE: House = {
  id: '', name: '', address: '', inviteCode: '',
  rules: [], ownerId: '', commonFund: 0,
}

interface HouseData {
  house: House
  members: Member[]
  chores: ChoreSchedule[]
  checkins: ChoreCheckin[]
  shifts: ShiftRequest[]
  shopping: ShoppingItem[]
  expenses: Expense[]
  fridge: FridgeItem[]
  votes: Vote[]
  visitors: Visitor[]
  messages: ChatMessage[]
  announcements: Announcement[]
  activities: ActivityItem[]
}

function buildSampleData(houseId: string, ownerId: string): Omit<HouseData, 'house'> {
  const m1: Member = { id: ownerId, houseId, name: '小王', avatar: '🧑', role: 'owner' }
  const m2: Member = { id: 'm2', houseId, name: '小李', avatar: '👩', role: 'member' }
  const m3: Member = { id: 'm3', houseId, name: '小张', avatar: '👨', role: 'member' }
  const m4: Member = { id: 'm4', houseId, name: '小陈', avatar: '👩‍🦰', role: 'member' }

  const members = [m1, m2, m3, m4]

  const chores: ChoreSchedule[] = [
    { id: 'c1', houseId, memberId: ownerId, date: getDateStr(0), choreType: '厨房', completed: false },
    { id: 'c2', houseId, memberId: 'm2', date: getDateStr(0), choreType: '客厅', completed: true },
    { id: 'c3', houseId, memberId: 'm3', date: getDateStr(0), choreType: '卫生间', completed: false },
    { id: 'c4', houseId, memberId: 'm4', date: getDateStr(1), choreType: '厨房', completed: false },
    { id: 'c5', houseId, memberId: ownerId, date: getDateStr(1), choreType: '客厅', completed: false },
    { id: 'c6', houseId, memberId: 'm2', date: getDateStr(2), choreType: '卫生间', completed: false },
    { id: 'c7', houseId, memberId: 'm3', date: getDateStr(2), choreType: '厨房', completed: false },
    { id: 'c8', houseId, memberId: 'm4', date: getDateStr(3), choreType: '客厅', completed: false },
  ]

  const checkins: ChoreCheckin[] = [
    { id: 'ck1', scheduleId: 'c2', memberId: 'm2', photoUrl: '', completedAt: getDateStr(0) + 'T09:30:00' },
  ]

  const shifts: ShiftRequest[] = [
    { id: 's1', houseId, requesterId: 'm3', targetId: 'm4', date: getDateStr(0), reason: '今天加班', status: 'pending' },
  ]

  const shopping: ShoppingItem[] = [
    { id: 'sh1', houseId, name: '抽纸', addedBy: ownerId, urgency: 'high', purchased: false },
    { id: 'sh2', houseId, name: '洗洁精', addedBy: 'm2', urgency: 'medium', purchased: false },
    { id: 'sh3', houseId, name: '垃圾袋', addedBy: ownerId, urgency: 'low', purchased: true, purchasedBy: 'm4', price: 12.9 },
    { id: 'sh4', houseId, name: '保鲜膜', addedBy: 'm3', urgency: 'medium', purchased: false },
    { id: 'sh5', houseId, name: '洁厕灵', addedBy: 'm2', urgency: 'high', purchased: true, purchasedBy: 'm2', price: 15.8 },
  ]

  const expenses: Expense[] = [
    {
      id: 'e1', houseId, payerId: ownerId, amount: 89.5, category: '日用品',
      splitType: 'equal', description: '超市采购日用品', createdAt: getDateStr(-2) + 'T14:00:00',
      settled: false, splits: [
        { memberId: ownerId, amount: 22.38, paid: true },
        { memberId: 'm2', amount: 22.38, paid: false },
        { memberId: 'm3', amount: 22.37, paid: true },
        { memberId: 'm4', amount: 22.37, paid: false },
      ],
    },
    {
      id: 'e2', houseId, payerId: 'm2', amount: 200, category: '公共基金',
      splitType: 'equal', description: '本月公共基金充值', createdAt: getDateStr(-5) + 'T10:00:00',
      settled: true, splits: [
        { memberId: ownerId, amount: 50, paid: true },
        { memberId: 'm2', amount: 50, paid: true },
        { memberId: 'm3', amount: 50, paid: true },
        { memberId: 'm4', amount: 50, paid: true },
      ],
    },
    {
      id: 'e3', houseId, payerId: 'm4', amount: 156, category: '水电费',
      splitType: 'equal', description: '6月水电费', createdAt: getDateStr(-1) + 'T09:00:00',
      settled: false, splits: [
        { memberId: ownerId, amount: 39, paid: false },
        { memberId: 'm2', amount: 39, paid: true },
        { memberId: 'm3', amount: 39, paid: false },
        { memberId: 'm4', amount: 39, paid: true },
      ],
    },
  ]

  const fridge: FridgeItem[] = [
    { id: 'f1', houseId, name: '牛奶', ownerId, ownership: 'shared', expiryDate: getDateStr(3), category: '饮品', borrowed: false },
    { id: 'f2', houseId, name: '鸡蛋', ownerId: 'm2', ownership: 'shared', expiryDate: getDateStr(7), category: '蛋类', borrowed: false },
    { id: 'f3', houseId, name: '酸奶', ownerId: 'm3', ownership: 'personal', expiryDate: getDateStr(1), category: '饮品', borrowed: false },
    { id: 'f4', houseId, name: '可乐', ownerId: 'm4', ownership: 'shared', expiryDate: getDateStr(30), category: '饮品', borrowed: false },
    { id: 'f5', houseId, name: '豆腐', ownerId, ownership: 'shared', expiryDate: getDateStr(-1), category: '豆制品', borrowed: false },
    { id: 'f6', houseId, name: '苹果', ownerId: 'm2', ownership: 'shared', expiryDate: getDateStr(5), category: '水果', borrowed: false },
  ]

  const votes: Vote[] = [
    {
      id: 'v1', houseId, createdBy: ownerId, title: '安静时段设置',
      type: 'quiet_hours', deadline: getDateStr(3), anonymous: false, status: 'active',
      options: [
        { label: '22:00 - 07:00', votes: [ownerId, 'm2'] },
        { label: '23:00 - 07:00', votes: ['m3'] },
        { label: '22:30 - 07:30', votes: ['m4'] },
      ],
    },
    {
      id: 'v2', houseId, createdBy: 'm2', title: '是否购买扫地机器人',
      type: 'general', deadline: getDateStr(5), anonymous: true, status: 'active',
      options: [
        { label: '购买，从公共基金出', votes: [ownerId, 'm2', 'm3'] },
        { label: '不购买，手动打扫', votes: ['m4'] },
      ],
    },
  ]

  const visitors: Visitor[] = [
    { id: 'vi1', houseId, hostId: ownerId, visitorName: '王妈妈', relation: '家人', visitDate: getDateStr(1) + 'T14:00:00', status: 'upcoming' },
    { id: 'vi2', houseId, hostId: 'm2', visitorName: '李同学', relation: '朋友', visitDate: getDateStr(0) + 'T10:00:00', leaveDate: getDateStr(0) + 'T18:00:00', status: 'visiting' },
    { id: 'vi3', houseId, hostId: 'm3', visitorName: '张同事', relation: '同事', visitDate: getDateStr(-3) + 'T19:00:00', leaveDate: getDateStr(-3) + 'T21:00:00', status: 'left' },
  ]

  const messages: ChatMessage[] = [
    { id: 'msg1', houseId, senderId: ownerId, content: '大家记得打卡哦！', type: 'text', createdAt: getDateStr(0) + 'T08:00:00' },
    { id: 'msg2', houseId, senderId: 'm2', content: '洗洁精快用完了，我加到购物清单了', type: 'text', createdAt: getDateStr(0) + 'T08:15:00' },
    { id: 'msg3', houseId, senderId: 'm3', content: '收到，我明天值日会注意', type: 'text', createdAt: getDateStr(0) + 'T08:20:00' },
    { id: 'msg4', houseId, senderId: 'system', content: '小张提交了换班申请', type: 'system', createdAt: getDateStr(0) + 'T09:00:00' },
    { id: 'msg5', houseId, senderId: 'm4', content: '这月水电费我垫付了，大家记得分摊', type: 'text', createdAt: getDateStr(0) + 'T10:30:00' },
    { id: 'msg6', houseId, senderId: ownerId, content: '好的，晚点我转给你', type: 'text', createdAt: getDateStr(0) + 'T10:35:00' },
  ]

  const announcements: Announcement[] = [
    { id: 'a1', houseId, authorId: ownerId, content: '本周六全屋大扫除，请各位室友预留时间！', createdAt: getDateStr(-1) + 'T20:00:00', readBy: [ownerId, 'm2'] },
    { id: 'a2', houseId, authorId: 'm2', content: '冰箱里的酸奶周三到期，请尽快饮用', createdAt: getDateStr(0) + 'T07:00:00', readBy: ['m2'] },
  ]

  const activities: ActivityItem[] = [
    { id: 'act1', houseId, memberId: 'm2', action: '打卡', detail: '完成了客厅清洁', createdAt: getDateStr(0) + 'T09:30:00' },
    { id: 'act2', houseId, memberId: 'm4', action: '记账', detail: '垫付了水电费 ¥156', createdAt: getDateStr(0) + 'T10:00:00' },
    { id: 'act3', houseId, memberId: 'm2', action: '购物', detail: '添加了洗洁精到清单', createdAt: getDateStr(0) + 'T08:15:00' },
    { id: 'act4', houseId, memberId: 'm3', action: '换班', detail: '申请今天家务换班', createdAt: getDateStr(0) + 'T09:00:00' },
    { id: 'act5', houseId, memberId: ownerId, action: '公告', detail: '发布了全屋大扫除通知', createdAt: getDateStr(-1) + 'T20:00:00' },
  ]

  return { members, chores, checkins, shifts, shopping, expenses, fridge, votes, visitors, messages, announcements, activities }
}

const HOUSE_STORAGE_PREFIX = 'tongju-house-'
const CURRENT_STORAGE_KEY = 'tongju-current'
const CHANNEL_NAME = 'tongju-sync'

function loadHouseData(inviteCode: string): HouseData | null {
  try {
    const raw = localStorage.getItem(HOUSE_STORAGE_PREFIX + inviteCode.toUpperCase())
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveHouseData(inviteCode: string, data: HouseData) {
  try {
    localStorage.setItem(HOUSE_STORAGE_PREFIX + inviteCode.toUpperCase(), JSON.stringify(data))
  } catch {}
}

function loadCurrentSession(): { inviteCode: string; memberId: string } | null {
  try {
    const raw = localStorage.getItem(CURRENT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveCurrentSession(inviteCode: string, memberId: string) {
  try {
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify({ inviteCode, memberId }))
  } catch {}
}

function clearCurrentSession() {
  try {
    localStorage.removeItem(CURRENT_STORAGE_KEY)
  } catch {}
}

interface AppState extends HouseData {
  currentMemberId: string

  hasHouse: () => boolean
  getCurrentMember: () => Member
  getMemberById: (id: string) => Member | undefined

  createHouse: (name: string, address: string, userName: string, avatar: string, withSample: boolean) => string
  joinHouse: (inviteCode: string, userName: string, avatar: string) => boolean
  leaveHouse: () => void

  updateHouseInfo: (info: Partial<Pick<House, 'name' | 'address' | 'rules'>>) => void

  addChoreCheckin: (scheduleId: string) => void
  toggleChoreComplete: (choreId: string) => void
  addShiftRequest: (request: Omit<ShiftRequest, 'id' | 'status'>) => void
  updateShiftStatus: (shiftId: string, status: ShiftRequest['status']) => void

  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void
  toggleShoppingPurchased: (itemId: string, price: number) => void
  removeShoppingItem: (itemId: string) => void

  addExpense: (expense: Omit<Expense, 'id'>) => void
  settleExpenseSplit: (expenseId: string, memberId: string) => void

  addFridgeItem: (item: Omit<FridgeItem, 'id'>) => void
  removeFridgeItem: (itemId: string) => void
  borrowFridgeItem: (itemId: string, borrowedBy: string, returnDate: string) => void
  returnFridgeItem: (itemId: string) => void

  addVote: (vote: Omit<Vote, 'id' | 'status'>) => void
  castVote: (voteId: string, optionIndex: number) => void

  addVisitor: (visitor: Omit<Visitor, 'id'>) => void
  updateVisitorStatus: (visitorId: string, status: Visitor['status']) => void

  sendMessage: (content: string, type?: ChatMessage['type']) => void
  markAnnouncementRead: (announcementId: string) => void
  addAnnouncement: (content: string) => void
}

let idCounter = 100
const genId = () => String(++idCounter)

let broadcastChannel: BroadcastChannel | null = null
let isSyncing = false

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      return null
    }
  }
  return broadcastChannel
}

function getInitialState() {
  const session = loadCurrentSession()
  if (session) {
    const data = loadHouseData(session.inviteCode)
    if (data) {
      return {
        ...data,
        currentMemberId: session.memberId,
      }
    }
  }
  return {
    currentMemberId: '',
    house: EMPTY_HOUSE,
    members: [],
    chores: [],
    checkins: [],
    shifts: [],
    shopping: [],
    expenses: [],
    fridge: [],
    votes: [],
    visitors: [],
    messages: [],
    announcements: [],
    activities: [],
  }
}

type Setter = (
  partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>),
  replace?: boolean | undefined
) => void

function persistHouseData(state: AppState) {
  if (state.house.inviteCode) {
    saveHouseData(state.house.inviteCode, {
      house: state.house,
      members: state.members,
      chores: state.chores,
      checkins: state.checkins,
      shifts: state.shifts,
      shopping: state.shopping,
      expenses: state.expenses,
      fridge: state.fridge,
      votes: state.votes,
      visitors: state.visitors,
      messages: state.messages,
      announcements: state.announcements,
      activities: state.activities,
    })
  }
}

function broadcastSync(state: AppState) {
  const ch = getBroadcastChannel()
  if (!ch || !state.house.inviteCode || isSyncing) return
  try {
    ch.postMessage({
      type: 'sync',
      inviteCode: state.house.inviteCode,
      data: {
        house: state.house,
        members: state.members,
        chores: state.chores,
        checkins: state.checkins,
        shifts: state.shifts,
        shopping: state.shopping,
        expenses: state.expenses,
        fridge: state.fridge,
        votes: state.votes,
        visitors: state.visitors,
        messages: state.messages,
        announcements: state.announcements,
        activities: state.activities,
      },
    })
  } catch {}
}

function withPersistence(set: Setter): Setter {
  return (partial, replace) => {
    set((state) => {
      const next = typeof partial === 'function' ? (partial as any)(state) : partial
      const nextState = replace ? next : { ...state, ...next }
      persistHouseData(nextState)
      broadcastSync(nextState)
      return nextState
    }, replace)
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const _set = withPersistence(set)

      return {
        ...getInitialState(),

        hasHouse: () => get().house.id !== '',

        getCurrentMember: () => {
          const state = get()
          return state.members.find(m => m.id === state.currentMemberId)!
        },
        getMemberById: (id) => {
          return get().members.find(m => m.id === id)
        },

        createHouse: (name, address, userName, avatar, withSample) => {
          const houseId = 'h_' + Date.now()
          const ownerId = 'm_' + Date.now()
          const inviteCode = genInviteCode()

          const house: House = {
            id: houseId, name, address, inviteCode,
            rules: [
              '公共区域保持整洁，用完即清',
              '晚上10点后降低音量',
              '厨房用后及时清洗',
              '访客需提前一天报备',
              '公共用品缺货及时补录',
            ],
            ownerId, commonFund: 0,
          }

          const owner: Member = { id: ownerId, houseId, name: userName, avatar, role: 'owner' }

          let data: HouseData
          if (withSample) {
            const sample = buildSampleData(houseId, ownerId)
            data = {
              house,
              ...sample,
              members: sample.members.map(m =>
                m.id === ownerId ? { ...m, name: userName, avatar } : m
              ),
            }
          } else {
            data = {
              house,
              members: [owner],
              chores: [],
              checkins: [],
              shifts: [],
              shopping: [],
              expenses: [],
              fridge: [],
              votes: [],
              visitors: [],
              messages: [],
              announcements: [],
              activities: [],
            }
          }

          saveHouseData(inviteCode, data)
          saveCurrentSession(inviteCode, ownerId)

          _set({
            currentMemberId: ownerId,
            ...data,
          })

          return inviteCode
        },

        joinHouse: (inviteCode, userName, avatar) => {
          const code = inviteCode.toUpperCase()
          const data = loadHouseData(code)
          if (!data) return false

          const newMember: Member = {
            id: 'm_' + Date.now(),
            houseId: data.house.id,
            name: userName, avatar, role: 'member',
          }

          const newData: HouseData = {
            ...data,
            members: [...data.members, newMember],
          }

          saveHouseData(code, newData)
          saveCurrentSession(code, newMember.id)

          _set({
            currentMemberId: newMember.id,
            ...newData,
          })

          return true
        },

        leaveHouse: () => {
          const state = get()
          const { inviteCode } = state.house
          const { currentMemberId } = state

          clearCurrentSession()

          let newMembers = state.members
          if (inviteCode && currentMemberId) {
            newMembers = state.members.filter(m => m.id !== currentMemberId)
            const newData: HouseData = {
              house: state.house,
              members: newMembers,
              chores: state.chores,
              checkins: state.checkins,
              shifts: state.shifts,
              shopping: state.shopping,
              expenses: state.expenses,
              fridge: state.fridge,
              votes: state.votes,
              visitors: state.visitors,
              messages: state.messages,
              announcements: state.announcements,
              activities: state.activities,
            }
            saveHouseData(inviteCode, newData)

            const ch = getBroadcastChannel()
            if (ch) {
              try {
                ch.postMessage({
                  type: 'sync',
                  inviteCode,
                  data: newData,
                })
              } catch {}
            }
          }

          set({
            currentMemberId: '',
            house: EMPTY_HOUSE,
            members: [],
            chores: [],
            checkins: [],
            shifts: [],
            shopping: [],
            expenses: [],
            fridge: [],
            votes: [],
            visitors: [],
            messages: [],
            announcements: [],
            activities: [],
          })
        },

        updateHouseInfo: (info) => {
          _set(state => ({
            house: { ...state.house, ...info },
          }))
        },

        addChoreCheckin: (scheduleId) => {
          const now = new Date().toISOString()
          const memberId = get().currentMemberId
          const chore = get().chores.find(c => c.id === scheduleId)
          if (!chore || chore.memberId !== memberId) return
          const checkin: ChoreCheckin = {
            id: genId(), scheduleId, memberId,
            photoUrl: '', completedAt: now,
          }
          _set(state => ({
            checkins: [...state.checkins, checkin],
            chores: state.chores.map(c =>
              c.id === scheduleId ? { ...c, completed: true } : c
            ),
          }))
        },
        toggleChoreComplete: (choreId) => {
          const memberId = get().currentMemberId
          const chore = get().chores.find(c => c.id === choreId)
          if (!chore || chore.memberId !== memberId) return
          _set(state => ({
            chores: state.chores.map(c =>
              c.id === choreId ? { ...c, completed: !c.completed } : c
            ),
          }))
        },

        addShiftRequest: (request) => {
          const shift: ShiftRequest = { ...request, id: genId(), status: 'pending' }
          _set(state => ({ shifts: [...state.shifts, shift] }))
        },
        updateShiftStatus: (shiftId, status) => {
          _set(state => ({
            shifts: state.shifts.map(s =>
              s.id === shiftId ? { ...s, status } : s
            ),
          }))
        },

        addShoppingItem: (item) => {
          const newItem: ShoppingItem = { ...item, id: genId() }
          _set(state => ({ shopping: [...state.shopping, newItem] }))
        },
        toggleShoppingPurchased: (itemId, price) => {
          _set(state => ({
            shopping: state.shopping.map(s =>
              s.id === itemId
                ? { ...s, purchased: !s.purchased, purchasedBy: s.purchased ? undefined : state.currentMemberId, price: s.purchased ? undefined : price }
                : s
            ),
          }))
        },
        removeShoppingItem: (itemId) => {
          _set(state => ({ shopping: state.shopping.filter(s => s.id !== itemId) }))
        },

        addExpense: (expense) => {
          const newExpense: Expense = { ...expense, id: genId() }
          _set(state => ({ expenses: [...state.expenses, newExpense] }))
        },
        settleExpenseSplit: (expenseId, memberId) => {
          _set(state => ({
            expenses: state.expenses.map(e => {
              if (e.id !== expenseId) return e
              const newSplits = e.splits.map(s =>
                s.memberId === memberId ? { ...s, paid: true } : s
              )
              return { ...e, splits: newSplits, settled: newSplits.every(s => s.paid) }
            }),
          }))
        },

        addFridgeItem: (item) => {
          const newItem: FridgeItem = { ...item, id: genId() }
          _set(state => ({ fridge: [...state.fridge, newItem] }))
        },
        removeFridgeItem: (itemId) => {
          _set(state => ({ fridge: state.fridge.filter(f => f.id !== itemId) }))
        },
        borrowFridgeItem: (itemId, borrowedBy, returnDate) => {
          _set(state => ({
            fridge: state.fridge.map(f =>
              f.id === itemId
                ? { ...f, borrowed: true, borrowedBy, borrowReturnDate: returnDate }
                : f
            ),
          }))
        },
        returnFridgeItem: (itemId) => {
          _set(state => ({
            fridge: state.fridge.map(f =>
              f.id === itemId
                ? { ...f, borrowed: false, borrowedBy: undefined, borrowReturnDate: undefined }
                : f
            ),
          }))
        },

        addVote: (vote) => {
          const newVote: Vote = { ...vote, id: genId(), status: 'active' }
          _set(state => ({ votes: [...state.votes, newVote] }))
        },
        castVote: (voteId, optionIndex) => {
          const memberId = get().currentMemberId
          _set(state => ({
            votes: state.votes.map(v =>
              v.id === voteId
                ? {
                    ...v,
                    options: v.options.map((opt, i) => ({
                      ...opt,
                      votes: i === optionIndex
                        ? [...opt.votes.filter(id => id !== memberId), memberId]
                        : opt.votes.filter(id => id !== memberId),
                    })),
                  }
                : v
            ),
          }))
        },

        addVisitor: (visitor) => {
          const newVisitor: Visitor = { ...visitor, id: genId() }
          _set(state => ({ visitors: [...state.visitors, newVisitor] }))
        },
        updateVisitorStatus: (visitorId, status) => {
          _set(state => ({
            visitors: state.visitors.map(v =>
              v.id === visitorId ? { ...v, status } : v
            ),
          }))
        },

        sendMessage: (content, type = 'text') => {
          const state = get()
          const msg: ChatMessage = {
            id: genId(), houseId: state.house.id, senderId: state.currentMemberId,
            content, type, createdAt: new Date().toISOString(),
          }
          _set(state => ({ messages: [...state.messages, msg] }))
        },
        markAnnouncementRead: (announcementId) => {
          const memberId = get().currentMemberId
          _set(state => ({
            announcements: state.announcements.map(a =>
              a.id === announcementId && !a.readBy.includes(memberId)
                ? { ...a, readBy: [...a.readBy, memberId] }
                : a
            ),
          }))
        },
        addAnnouncement: (content) => {
          const state = get()
          const ann: Announcement = {
            id: genId(), houseId: state.house.id, authorId: state.currentMemberId,
            content, createdAt: new Date().toISOString(), readBy: [state.currentMemberId],
          }
          _set(state => ({ announcements: [ann, ...state.announcements] }))
        },
      }
    },
    {
      name: 'tongju-store',
      partialize: (state) => ({
        currentMemberId: state.currentMemberId,
        house: state.house,
        members: state.members,
        chores: state.chores,
        checkins: state.checkins,
        shifts: state.shifts,
        shopping: state.shopping,
        expenses: state.expenses,
        fridge: state.fridge,
        votes: state.votes,
        visitors: state.visitors,
        messages: state.messages,
        announcements: state.announcements,
        activities: state.activities,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.house.inviteCode) {
          persistHouseData(state)
        }
      },
    }
  )
)

export function useBroadcastSync() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const ch = getBroadcastChannel()
    if (!ch) return

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'sync') return
      const currentInvite = useAppStore.getState().house.inviteCode
      if (!currentInvite || event.data.inviteCode !== currentInvite) return

      isSyncing = true
      try {
        useAppStore.setState({
          house: event.data.data.house,
          members: event.data.data.members,
          chores: event.data.data.chores,
          checkins: event.data.data.checkins,
          shifts: event.data.data.shifts,
          shopping: event.data.data.shopping,
          expenses: event.data.data.expenses,
          fridge: event.data.data.fridge,
          votes: event.data.data.votes,
          visitors: event.data.data.visitors,
          messages: event.data.data.messages,
          announcements: event.data.data.announcements,
          activities: event.data.data.activities,
        })
        forceUpdate(n => n + 1)
      } finally {
        setTimeout(() => { isSyncing = false }, 50)
      }
    }

    ch.addEventListener('message', handler)
    return () => ch.removeEventListener('message', handler)
  }, [])
}
