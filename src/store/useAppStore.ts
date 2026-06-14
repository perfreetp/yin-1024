import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

function buildSampleData(houseId: string, ownerId: string): {
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
} {
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

interface AppState {
  currentMemberId: string
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

  hasHouse: () => boolean
  getCurrentMember: () => Member
  getMemberById: (id: string) => Member | undefined

  createHouse: (name: string, address: string, userName: string, avatar: string, withSample: boolean) => void
  joinHouse: (inviteCode: string, userName: string, avatar: string) => boolean

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

  updateHouseRules: (rules: string[]) => void
}

let idCounter = 100
const genId = () => String(++idCounter)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

        if (withSample) {
          const sample = buildSampleData(houseId, ownerId)
          set({
            currentMemberId: ownerId,
            house,
            members: sample.members,
            chores: sample.chores,
            checkins: sample.checkins,
            shifts: sample.shifts,
            shopping: sample.shopping,
            expenses: sample.expenses,
            fridge: sample.fridge,
            votes: sample.votes,
            visitors: sample.visitors,
            messages: sample.messages,
            announcements: sample.announcements,
            activities: sample.activities,
          })
        } else {
          set({
            currentMemberId: ownerId,
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
          })
        }
      },

      joinHouse: (inviteCode, userName, avatar) => {
        const state = get()
        if (state.house.inviteCode.toUpperCase() !== inviteCode.toUpperCase()) return false
        const newMember: Member = {
          id: 'm_' + Date.now(),
          houseId: state.house.id,
          name: userName, avatar, role: 'member',
        }
        set(s => ({
          currentMemberId: newMember.id,
          members: [...s.members, newMember],
        }))
        return true
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
        set(state => ({
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
        set(state => ({
          chores: state.chores.map(c =>
            c.id === choreId ? { ...c, completed: !c.completed } : c
          ),
        }))
      },

      addShiftRequest: (request) => {
        const shift: ShiftRequest = { ...request, id: genId(), status: 'pending' }
        set(state => ({ shifts: [...state.shifts, shift] }))
      },
      updateShiftStatus: (shiftId, status) => {
        set(state => ({
          shifts: state.shifts.map(s =>
            s.id === shiftId ? { ...s, status } : s
          ),
        }))
      },

      addShoppingItem: (item) => {
        const newItem: ShoppingItem = { ...item, id: genId() }
        set(state => ({ shopping: [...state.shopping, newItem] }))
      },
      toggleShoppingPurchased: (itemId, price) => {
        set(state => ({
          shopping: state.shopping.map(s =>
            s.id === itemId
              ? { ...s, purchased: !s.purchased, purchasedBy: s.purchased ? undefined : state.currentMemberId, price: s.purchased ? undefined : price }
              : s
          ),
        }))
      },
      removeShoppingItem: (itemId) => {
        set(state => ({ shopping: state.shopping.filter(s => s.id !== itemId) }))
      },

      addExpense: (expense) => {
        const newExpense: Expense = { ...expense, id: genId() }
        set(state => ({ expenses: [...state.expenses, newExpense] }))
      },
      settleExpenseSplit: (expenseId, memberId) => {
        set(state => ({
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
        set(state => ({ fridge: [...state.fridge, newItem] }))
      },
      removeFridgeItem: (itemId) => {
        set(state => ({ fridge: state.fridge.filter(f => f.id !== itemId) }))
      },
      borrowFridgeItem: (itemId, borrowedBy, returnDate) => {
        set(state => ({
          fridge: state.fridge.map(f =>
            f.id === itemId
              ? { ...f, borrowed: true, borrowedBy, borrowReturnDate: returnDate }
              : f
          ),
        }))
      },
      returnFridgeItem: (itemId) => {
        set(state => ({
          fridge: state.fridge.map(f =>
            f.id === itemId
              ? { ...f, borrowed: false, borrowedBy: undefined, borrowReturnDate: undefined }
              : f
          ),
        }))
      },

      addVote: (vote) => {
        const newVote: Vote = { ...vote, id: genId(), status: 'active' }
        set(state => ({ votes: [...state.votes, newVote] }))
      },
      castVote: (voteId, optionIndex) => {
        const memberId = get().currentMemberId
        set(state => ({
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
        set(state => ({ visitors: [...state.visitors, newVisitor] }))
      },
      updateVisitorStatus: (visitorId, status) => {
        set(state => ({
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
        set(state => ({ messages: [...state.messages, msg] }))
      },
      markAnnouncementRead: (announcementId) => {
        const memberId = get().currentMemberId
        set(state => ({
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
        set(state => ({ announcements: [ann, ...state.announcements] }))
      },

      updateHouseRules: (rules) => {
        set(state => ({ house: { ...state.house, rules } }))
      },
    }),
    { name: 'tongju-store' }
  )
)
