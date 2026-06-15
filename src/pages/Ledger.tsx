import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'
import { Plus, X, Wallet, TrendingDown, Check, AlertCircle } from 'lucide-react'

const CATEGORIES = ['日用品', '水电费', '公共基金', '网费', '其他']

export default function Ledger() {
  const expenses = useAppStore(s => s.expenses)
  const members = useAppStore(s => s.members)
  const house = useAppStore(s => s.house)
  const addExpense = useAppStore(s => s.addExpense)
  const settleExpenseSplit = useAppStore(s => s.settleExpenseSplit)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)

  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('日用品')
  const [description, setDescription] = useState('')
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')

  const unsettled = expenses.filter(e => !e.settled)
  const settled = expenses.filter(e => e.settled)

  const myUnpaidBills = expenses.filter(e => !e.settled).flatMap(e =>
    e.splits.filter(s => s.memberId === currentMemberId && !s.paid).map(s => ({
      expenseId: e.id,
      description: e.description,
      amount: s.amount,
      payerId: e.payerId,
      category: e.category,
    }))
  )

  const totalUnpaid = myUnpaidBills.reduce((sum, b) => sum + b.amount, 0)

  const totalIncome = expenses
    .filter(e => e.category === '公共基金')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = expenses
    .filter(e => e.category !== '公共基金')
    .reduce((sum, e) => sum + e.amount, 0)

  function handleSubmit() {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return

    const perPerson = Math.round((numAmount / members.length) * 100) / 100
    const remainder = Math.round((numAmount - perPerson * members.length) * 100) / 100

    const splits = members.map((m, i) => ({
      memberId: m.id,
      amount: i === 0 ? perPerson + remainder : perPerson,
      paid: m.id === currentMemberId,
    }))

    addExpense({
      houseId: house.id,
      payerId: currentMemberId,
      amount: numAmount,
      category,
      splitType,
      description: description || category,
      createdAt: new Date().toISOString(),
      settled: false,
      splits,
    })

    setAmount('')
    setCategory('日用品')
    setDescription('')
    setSplitType('equal')
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader title="账本" />

      <div className="page-container">
        <div className="card mb-4 bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="flex items-center gap-2 mb-2 text-white/80 text-sm">
            <Wallet className="w-4 h-4" />
            <span>公共基金余额</span>
          </div>
          <div className="text-3xl font-black mb-3">
            ¥{house.commonFund.toFixed(2)}
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-white/90">
              <TrendingDown className="w-3.5 h-3.5 rotate-180" />
              充值 ¥{totalIncome.toFixed(2)}
            </span>
            <span className="flex items-center gap-1 text-white/90">
              <TrendingDown className="w-3.5 h-3.5" />
              支出 ¥{totalExpense.toFixed(2)}
            </span>
          </div>
        </div>

        {myUnpaidBills.length > 0 && (
          <div className="mb-6">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
              我的待付款
              <span className="ml-auto text-sm font-bold text-[var(--color-danger)]">
                ¥{totalUnpaid.toFixed(2)}
              </span>
            </h2>
            <div className="space-y-2">
              {myUnpaidBills.map((bill, i) => {
                const payer = getMemberById(bill.payerId)
                return (
                  <div
                    key={i}
                    className="card !p-3 border-2 border-red-200 bg-red-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar memberId={bill.payerId} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">
                          {bill.description}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {bill.category} · {payer?.name} 垫付
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-bold text-[var(--color-danger)]">
                        ¥{bill.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => settleExpenseSplit(bill.expenseId, currentMemberId)}
                        className="px-3 py-1.5 bg-[var(--color-danger)] text-white text-xs rounded-full font-medium active:scale-90 transition-transform"
                      >
                        立即结算
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="section-title mb-3">待结算</h2>
          {unsettled.length === 0 ? (
            <div className="card text-center py-8 text-[var(--color-text-muted)]">
              暂无待结算账单
            </div>
          ) : (
            <div className="space-y-3">
              {unsettled.map(expense => {
                const payer = getMemberById(expense.payerId)
                const unpaidSplits = expense.splits.filter(s => !s.paid)
                return (
                  <div key={expense.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--color-text)] truncate">
                          {expense.description}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {expense.category} · {expense.createdAt.slice(0, 10)}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary ml-2">
                        ¥{expense.amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm text-[var(--color-text-secondary)]">
                      <span>垫付人</span>
                      <Avatar memberId={expense.payerId} size="sm" showName />
                    </div>

                    <div className="space-y-1.5">
                      {expense.splits.map(split => {
                        const member = getMemberById(split.memberId)
                        return (
                          <div
                            key={split.memberId}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar memberId={split.memberId} size="sm" />
                              <span className="text-[var(--color-text-secondary)]">
                                {member?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={split.paid ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}>
                                ¥{split.amount.toFixed(2)}
                              </span>
                              {split.paid ? (
                                <span className="badge-done">已付</span>
                              ) : (
                                split.memberId === currentMemberId ? (
                                  <button
                                    onClick={() => settleExpenseSplit(expense.id, split.memberId)}
                                    className="badge bg-primary/10 text-primary cursor-pointer active:scale-95 transition-transform"
                                  >
                                    结算
                                  </button>
                                ) : (
                                  <span className="badge-pending">未付</span>
                                )
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {unpaidSplits.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-cream-dark text-xs text-[var(--color-text-muted)]">
                        {unpaidSplits.length}人未结清
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="section-title mb-3">历史账单</h2>
          {settled.length === 0 ? (
            <div className="card text-center py-8 text-[var(--color-text-muted)]">
              暂无历史账单
            </div>
          ) : (
            <div className="space-y-2">
              {settled.map(expense => (
                <div key={expense.id} className="card opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-text-secondary)] truncate">
                        {expense.description}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1">
                        {expense.category} · {expense.createdAt.slice(0, 10)}
                        <Check className="w-3 h-3 text-[var(--color-success)]" />
                      </div>
                    </div>
                    <div className="text-[var(--color-text-muted)] font-medium ml-2">
                      ¥{expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-white shadow-float flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--color-text)]">记一笔</h3>
              <button onClick={() => setShowForm(false)} className="p-1 active:scale-90 transition-transform">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  金额
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-lg font-bold text-[var(--color-text)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  类别
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-primary text-white'
                          : 'bg-cream text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  描述
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="简要说明"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark text-sm text-[var(--color-text)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  分摊方式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSplitType('equal')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      splitType === 'equal'
                        ? 'bg-primary text-white'
                        : 'bg-cream text-[var(--color-text-secondary)]'
                    }`}
                  >
                    均摊
                  </button>
                  <button
                    onClick={() => setSplitType('custom')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      splitType === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-cream text-[var(--color-text-secondary)]'
                    }`}
                  >
                    自定义
                  </button>
                </div>
                {splitType === 'equal' && amount && parseFloat(amount) > 0 && (
                  <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                    每人 ¥{(parseFloat(amount) / members.length).toFixed(2)}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full btn-primary disabled:opacity-40 disabled:active:scale-100"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
