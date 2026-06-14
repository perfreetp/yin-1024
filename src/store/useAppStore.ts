import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  House, Member, ChoreSchedule, ChoreCheckin, ShiftRequest,
  ShoppingItem, Expense, FridgeItem, Vote, Visitor,
  ChatMessage, Announcement, ActivityItem
} from '@/types'

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', houseId: 'h1', name: '小王', avatar: '🧑', role: 'owner' },
  { id: 'm2', houseId: 'h1', name: '小李', avatar: '👩', role: 'member' },
  { id: 'm3', houseId: 'h1', name: '小张', avatar: '👨', role: 'member' },
  { id: 'm4', houseId: 'h1', name: '小陈', avatar: '👩‍🦰', role: 'member' },
]

const MOCK_HOUSE: House = {
  id: 'h1', name: '幸福里302', address: '朝阳区幸福小区3号楼302',
  inviteCode: 'HAPPY302', rules: [
    '公共区域保持整洁，用完即清',
    '晚上10点后降低音量',
    '厨房用后及时清洗',
    '访客需提前一天报备',
    '公共用品缺货及时补录',
  ],
  ownerId: 'm1', commonFund: 368.50,
}

function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

const MOCK_CHORES: ChoreSchedule[] = [
  { id: 'c1', houseId: 'h1', memberId: 'm1', date: getDateStr(0), choreType: '厨房', completed: false },
  { id: 'c2', houseId: 'h1', memberId: 'm2', date: getDateStr(0), choreType: '客厅', completed: true },
  { id: 'c3', houseId: 'h1', memberId: 'm3', date: getDateStr(0), choreType: '卫生间', completed: false },
  { id: 'c4', houseId: 'h1', memberId: 'm4', date: getDateStr(1), choreType: '厨房', completed: false },
  { id: 'c5', houseId: 'h1', memberId: 'm1', date: getDateStr(1), choreType: '客厅', completed: false },
  { id: 'c6', houseId: 'h1', memberId: 'm2', date: getDateStr(2), choreType: '卫生间', completed: false },
  { id: 'c7', houseId: 'h1', memberId: 'm3', date: getDateStr(2), choreType: '厨房', completed: false },
  { id: 'c8', houseId: 'h1', memberId: 'm4', date: getDateStr(3), choreType: '客厅', completed: false },
]

const MOCK_CHECKINS: ChoreCheckin[] = [
  { id: 'ck1', scheduleId: 'c2', memberId: 'm2', photoUrl: '', completedAt: getDateStr(0) + 'T09:30:00' },
]

const MOCK_SHIFTS: ShiftRequest[] = [
  { id: 's1', houseId: 'h1', requesterId: 'm3', targetId: 'm4', date: getDateStr(0), reason: '今天加班', status: 'pending' },
]

const MOCK_SHOPPING: ShoppingItem[] = [
  { id: 'sh1', houseId: 'h1', name: '抽纸', addedBy: 'm1', urgency: 'high', purchased: false },
  { id: 'sh2', houseId: 'h1', name: '洗洁精', addedBy: 'm2', urgency: 'medium', purchased: false },
  { id: 'sh3', houseId: 'h1', name: '垃圾袋', addedBy: 'm1', urgency: 'low', purchased: true, purchasedBy: 'm4', price: 12.9 },
  { id: 'sh4', houseId: 'h1', name: '保鲜膜', addedBy: 'm3', urgency: 'medium', purchased: false },
  { id: 'sh5', houseId: 'h1', name: '洁厕灵', addedBy: 'm2', urgency: 'high', purchased: true, purchasedBy: 'm2', price: 15.8 },
]

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1', houseId: 'h1', payerId: 'm1', amount: 89.5, category: '日用品',
    splitType: 'equal', description: '超市采购日用品', createdAt: getDateStr(-2) + 'T14:00:00',
    settled: false, splits: [
      { memberId: 'm1', amount: 22.38, paid: true },
      { memberId: 'm2', amount: 22.38, paid: false },
      { memberId: 'm3', amount: 22.37, paid: true },
      { memberId: 'm4', amount: 22.37, paid: false },
    ],
  },
  {
    id: 'e2', houseId: 'h1', payerId: 'm2', amount: 200, category: '公共基金',
    splitType: 'equal', description: '本月公共基金充值', createdAt: getDateStr(-5) + 'T10:00:00',
    settled: true, splits: [
      { memberId: 'm1', amount: 50, paid: true },
      { memberId: 'm2', amount: 50, paid: true },
      { memberId: 'm3', amount: 50, paid: true },
      { memberId: 'm4', amount: 50, paid: true },
    ],
  },
  {
    id: 'e3', houseId: 'h1', payerId: 'm4', amount: 156, category: '水电费',
    splitType: 'equal', description: '6月水电费', createdAt: getDateStr(-1) + 'T09:00:00',
    settled: false, splits: [
      { memberId: 'm1', amount: 39, paid: false },
      { memberId: 'm2', amount: 39, paid: true },
      { memberId: 'm3', amount: 39, paid: false },
      { memberId: 'm4', amount: 39, paid: true },
    ],
  },
]

const MOCK_FRIDGE: FridgeItem[] = [
  { id: 'f1', houseId: 'h1', name: '牛奶', ownerId: 'm1', ownership: 'shared', expiryDate: getDateStr(3), category: '饮品', borrowed: false },
  { id: 'f2', houseId: 'h1', name: '鸡蛋', ownerId: 'm2', ownership: 'shared', expiryDate: getDateStr(7), category: '蛋类', borrowed: false },
  { id: 'f3', houseId: 'h1', name: '酸奶', ownerId: 'm3', ownership: 'personal', expiryDate: getDateStr(1), category: '饮品', borrowed: false },
  { id: 'f4', houseId: 'h1', name: '可乐', ownerId: 'm4', ownership: 'personal', expiryDate: getDateStr(30), category: '饮品', borrowed: true, borrowedBy: 'm1', borrowReturnDate: getDateStr(1) },
  { id: 'f5', houseId: 'h1', name: '豆腐', ownerId: 'm1', ownership: 'shared', expiryDate: getDateStr(-1), category: '豆制品', borrowed: false },
  { id: 'f6', houseId: 'h1', name: '苹果', ownerId: 'm2', ownership: 'shared', expiryDate: getDateStr(5), category: '水果', borrowed: false },
]

const MOCK_VOTES: Vote[] = [
  {
    id: 'v1', houseId: 'h1', createdBy: 'm1', title: '安静时段设置',
    type: 'quiet_hours', deadline: getDateStr(3), anonymous: false, status: 'active',
    options: [
      { label: '22:00 - 07:00', votes: ['m1', 'm2'] },
      { label: '23:00 - 07:00', votes: ['m3'] },
      { label: '22:30 - 07:30', votes: ['m4'] },
    ],
  },
  {
    id: 'v2', houseId: 'h1', createdBy: 'm2', title: '是否购买扫地机器人',
    type: 'general', deadline: getDateStr(5), anonymous: true, status: 'active',
    options: [
      { label: '购买，从公共基金出', votes: ['m1', 'm2', 'm3'] },
      { label: '不购买，手动打扫', votes: ['m4'] },
    ],
  },
]

const MOCK_VISITORS: Visitor[] = [
  { id: 'vi1', houseId: 'h1', hostId: 'm1', visitorName: '王妈妈', relation: '母亲', visitDate: getDateStr(1) + 'T14:00:00', status: 'upcoming' },
  { id: 'vi2', houseId: 'h1', hostId: 'm2', visitorName: '李同学', relation: '朋友', visitDate: getDateStr(0) + 'T10:00:00', leaveDate: getDateStr(0) + 'T18:00:00', status: 'visiting' },
  { id: 'vi3', houseId: 'h1', hostId: 'm3', visitorName: '张同事', relation: '同事', visitDate: getDateStr(-3) + 'T19:00:00', leaveDate: getDateStr(-3) + 'T21:00:00', status: 'left' },
]

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'msg1', houseId: 'h1', senderId: 'm1', content: '大家记得打卡哦！', type: 'text', createdAt: getDateStr(0) + 'T08:00:00' },
  { id: 'msg2', houseId: 'h1', senderId: 'm2', content: '洗洁精快用完了，我加到购物清单了', type: 'text', createdAt: getDateStr(0) + 'T08:15:00' },
  { id: 'msg3', houseId: 'h1', senderId: 'm3', content: '收到，我明天值日会注意', type: 'text', createdAt: getDateStr(0) + 'T08:20:00' },
  { id: 'msg4', houseId: 'h1', senderId: 'system', content: '小张提交了换班申请', type: 'system', createdAt: getDateStr(0) + 'T09:00:00' },
  { id: 'msg5', houseId: 'h1', senderId: 'm4', content: '这月水电费我垫付了，大家记得分摊', type: 'text', createdAt: getDateStr(0) + 'T10:30:00' },
  { id: 'msg6', houseId: 'h1', senderId: 'm1', content: '好的，晚点我转给你', type: 'text', createdAt: getDateStr(0) + 'T10:35:00' },
]

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', houseId: 'h1', authorId: 'm1', content: '本周六全屋大扫除，请各位室友预留时间！', createdAt: getDateStr(-1) + 'T20:00:00', readBy: ['m1', 'm2'] },
  { id: 'a2', houseId: 'h1', authorId: 'm2', content: '冰箱里的酸奶周三到期，请尽快饮用', createdAt: getDateStr(0) + 'T07:00:00', readBy: ['m2'] },
]

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'act1', houseId: 'h1', memberId: 'm2', action: '打卡', detail: '完成了客厅清洁', createdAt: getDateStr(0) + 'T09:30:00' },
  { id: 'act2', houseId: 'h1', memberId: 'm4', action: '记账', detail: '垫付了水电费 ¥156', createdAt: getDateStr(0) + 'T10:00:00' },
  { id: 'act3', houseId: 'h1', memberId: 'm2', action: '购物', detail: '添加了洗洁精到清单', createdAt: getDateStr(0) + 'T08:15:00' },
  { id: 'act4', houseId: 'h1', memberId: 'm3', action: '换班', detail: '申请今天家务换班', createdAt: getDateStr(0) + 'T09:00:00' },
  { id: 'act5', houseId: 'h1', memberId: 'm1', action: '公告', detail: '发布了全屋大扫除通知', createdAt: getDateStr(-1) + 'T20:00:00' },
]

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

  getCurrentMember: () => Member
  getMemberById: (id: string) => Member | undefined

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
  toggleFridgeBorrow: (itemId: string, borrowedBy: string) => void

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
      currentMemberId: 'm1',
      house: MOCK_HOUSE,
      members: MOCK_MEMBERS,
      chores: MOCK_CHORES,
      checkins: MOCK_CHECKINS,
      shifts: MOCK_SHIFTS,
      shopping: MOCK_SHOPPING,
      expenses: MOCK_EXPENSES,
      fridge: MOCK_FRIDGE,
      votes: MOCK_VOTES,
      visitors: MOCK_VISITORS,
      messages: MOCK_MESSAGES,
      announcements: MOCK_ANNOUNCEMENTS,
      activities: MOCK_ACTIVITIES,

      getCurrentMember: () => {
        const state = get()
        return state.members.find(m => m.id === state.currentMemberId)!
      },
      getMemberById: (id) => {
        return get().members.find(m => m.id === id)
      },

      addChoreCheckin: (scheduleId) => {
        const now = new Date().toISOString()
        const checkin: ChoreCheckin = {
          id: genId(), scheduleId, memberId: get().currentMemberId,
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
          expenses: state.expenses.map(e =>
            e.id === expenseId
              ? {
                  ...e,
                  splits: e.splits.map(s =>
                    s.memberId === memberId ? { ...s, paid: true } : s
                  ),
                  settled: e.splits.every(s => s.memberId === memberId ? true : s.paid),
                }
              : e
          ),
        }))
      },

      addFridgeItem: (item) => {
        const newItem: FridgeItem = { ...item, id: genId() }
        set(state => ({ fridge: [...state.fridge, newItem] }))
      },
      removeFridgeItem: (itemId) => {
        set(state => ({ fridge: state.fridge.filter(f => f.id !== itemId) }))
      },
      toggleFridgeBorrow: (itemId, borrowedBy) => {
        set(state => ({
          fridge: state.fridge.map(f =>
            f.id === itemId
              ? f.borrowed
                ? { ...f, borrowed: false, borrowedBy: undefined, borrowReturnDate: undefined }
                : { ...f, borrowed: true, borrowedBy, borrowReturnDate: getDateStr(3) }
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
        const msg: ChatMessage = {
          id: genId(), houseId: 'h1', senderId: get().currentMemberId,
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
        const ann: Announcement = {
          id: genId(), houseId: 'h1', authorId: get().currentMemberId,
          content, createdAt: new Date().toISOString(), readBy: [get().currentMemberId],
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
