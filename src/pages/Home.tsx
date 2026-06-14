import { Link } from 'react-router-dom'
import { Clock, PenLine, ShoppingCart, UserRoundPlus, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import Avatar from '@/components/Avatar'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return '早上好'
  if (h >= 12 && h < 14) return '中午好'
  if (h >= 14 && h < 18) return '下午好'
  if (h >= 18 && h < 24) return '晚上好'
  return '夜深了'
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}小时前`
  return `${Math.floor(diffHour / 24)}天前`
}

const QUICK_ENTRIES = [
  { icon: Clock, label: '打卡', to: '/checkin', color: 'bg-[var(--color-primary)]' },
  { icon: PenLine, label: '记一笔', to: '/ledger', color: 'bg-[var(--color-secondary)]' },
  { icon: ShoppingCart, label: '加购物', to: '/shopping', color: 'bg-[var(--color-accent)]' },
  { icon: UserRoundPlus, label: '报访客', to: '/visitors', color: 'bg-[var(--color-warning)]' },
]

export default function Home() {
  const getCurrentMember = useAppStore(s => s.getCurrentMember)
  const members = useAppStore(s => s.members)
  const chores = useAppStore(s => s.chores)
  const expenses = useAppStore(s => s.expenses)
  const shopping = useAppStore(s => s.shopping)
  const activities = useAppStore(s => s.activities)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)
  const settleExpenseSplit = useAppStore(s => s.settleExpenseSplit)

  const me = getCurrentMember()
  const today = getTodayStr()
  const todayChores = chores.filter(c => c.date === today)

  const onDutyMembers = todayChores.map(c => {
    const member = getMemberById(c.memberId)
    return member ? { ...c, member } : null
  }).filter(Boolean) as (typeof todayChores[0] & { member: NonNullable<ReturnType<typeof getMemberById>> })[]

  const now = new Date()
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

  const monthChores = chores.filter(c => {
    const d = new Date(c.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const choreCompleteRate = monthChores.length > 0
    ? Math.round((monthChores.filter(c => c.completed).length / monthChores.length) * 100)
    : 0

  const purchaseCount = shopping.filter(s => s.purchased).length

  const myUnpaidBills = expenses.filter(e => !e.settled).flatMap(e =>
    e.splits.filter(s => s.memberId === currentMemberId && !s.paid).map(s => ({
      expenseId: e.id,
      description: e.description,
      amount: s.amount,
      payerId: e.payerId,
    }))
  )

  const othersUnpaidBills = expenses.filter(e => !e.settled).flatMap(e =>
    e.splits.filter(s => s.memberId !== currentMemberId && !s.paid)
  ).length

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Avatar memberId={me.id} size="lg" />
        <div>
          <div className="text-xl font-bold text-[var(--color-text)]">{getGreeting()}，{me.name}</div>
          <div className="text-sm text-[var(--color-text-secondary)]">{today}</div>
        </div>
      </div>

      {myUnpaidBills.length > 0 && (
        <Link to="/ledger" className="block">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
              <span className="font-bold text-[var(--color-danger)]">你有 {myUnpaidBills.length} 笔待结清账单</span>
            </div>
            <div className="space-y-2">
              {myUnpaidBills.map((bill, i) => {
                const payer = getMemberById(bill.payerId)
                return (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{bill.description}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">垫付人：{payer?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-bold text-[var(--color-danger)]">¥{bill.amount.toFixed(2)}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); settleExpenseSplit(bill.expenseId, currentMemberId) }}
                        className="px-2.5 py-1 bg-[var(--color-danger)] text-white text-xs rounded-full font-medium active:scale-90 transition-transform"
                      >
                        结算
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {othersUnpaidBills > 0 && (
              <p className="text-xs text-[var(--color-text-muted)] mt-2">还有 {othersUnpaidBills} 笔他人未结清账单</p>
            )}
          </div>
        </Link>
      )}

      <Link to="/chores" className="card-hover block">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title text-base">🏠 今日值日</span>
          <span className="text-xs text-[var(--color-text-muted)]">查看家务板 →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {onDutyMembers.map(item => (
            <div
              key={item.id}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all ${
                item.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
              }`}
            >
              <div className="text-2xl">{item.member.avatar}</div>
              <span className="text-sm font-medium text-[var(--color-text)]">{item.member.name}</span>
              <span className={`text-xs ${item.completed ? 'text-green-600' : 'text-[var(--color-primary)]'}`}>
                {item.choreType}{item.completed ? ' ✓' : ''}
              </span>
            </div>
          ))}
        </div>
      </Link>

      <div>
        <div className="section-title mb-3 text-base">⚡ 快捷入口</div>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ENTRIES.map(entry => (
            <Link
              key={entry.label}
              to={entry.to}
              className="flex flex-col items-center gap-2"
            >
              <div className={`${entry.color} w-12 h-12 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform`}>
                <entry.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{entry.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title mb-4 text-base">📊 月末总结</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">本月开销</span>
            <span className="text-lg font-bold text-[var(--color-primary)]">¥{totalExpense.toFixed(0)}</span>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalExpense / 1000) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">家务完成率</span>
            <span className="text-lg font-bold text-[var(--color-secondary)]">{choreCompleteRate}%</span>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-secondary)] rounded-full transition-all duration-500"
                style={{ width: `${choreCompleteRate}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">购物次数</span>
            <span className="text-lg font-bold text-[var(--color-accent)]">{purchaseCount}次</span>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (purchaseCount / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="section-title mb-3 text-base">📰 室友动态</div>
        <div className="space-y-3">
          {activities.map(act => {
            const member = getMemberById(act.memberId)
            return (
              <div key={act.id} className="card flex items-center gap-3 !p-3">
                <Avatar memberId={act.memberId} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--color-text)]">
                    <span className="font-medium">{member?.name}</span>
                    <span className="text-[var(--color-text-secondary)]"> {act.detail}</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{formatTime(act.createdAt)}</div>
                </div>
                <span className="badge bg-cream text-[var(--color-text-secondary)] shrink-0">{act.action}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
