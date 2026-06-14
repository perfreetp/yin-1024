import { useState, useRef } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

const CATEGORY_EMOJI: Record<string, string> = {
  '饮品': '🥤',
  '蛋类': '🥚',
  '豆制品': '🧈',
  '水果': '🍎',
}

const CATEGORIES = ['饮品', '蛋类', '豆制品', '水果', '其他']

const OWNERSHIP_CONFIG = {
  shared: { label: '公共', className: 'bg-green-100 text-green-600' },
  personal: { label: '个人', className: 'bg-blue-100 text-blue-600' },
}

function getDaysUntil(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - todayStart.getTime()) / 86400000)
}

export default function Fridge() {
  const fridge = useAppStore(s => s.fridge)
  const addFridgeItem = useAppStore(s => s.addFridgeItem)
  const toggleFridgeBorrow = useAppStore(s => s.toggleFridgeBorrow)
  const removeFridgeItem = useAppStore(s => s.removeFridgeItem)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('饮品')
  const [newOwnership, setNewOwnership] = useState<'shared' | 'personal'>('shared')
  const [newExpiryDate, setNewExpiryDate] = useState('')

  const gridRef = useRef<HTMLDivElement>(null)

  const nearExpiryItems = fridge.filter(item => {
    if (!item.expiryDate) return false
    const days = getDaysUntil(item.expiryDate)
    return days > 0 && days <= 3
  })

  const expiredItems = fridge.filter(item => {
    if (!item.expiryDate) return false
    return getDaysUntil(item.expiryDate) <= 0
  })

  const borrowedItems = fridge.filter(item => item.borrowed && item.ownership === 'shared')

  const handleAdd = () => {
    if (!newName.trim()) return
    addFridgeItem({
      houseId: 'h1',
      name: newName.trim(),
      ownerId: currentMemberId,
      ownership: newOwnership,
      expiryDate: newExpiryDate || undefined,
      category: newCategory,
      borrowed: false,
    })
    setNewName('')
    setNewCategory('饮品')
    setNewOwnership('shared')
    setNewExpiryDate('')
    setShowAdd(false)
  }

  const handleReturn = (itemId: string, borrowedBy: string) => {
    toggleFridgeBorrow(itemId, borrowedBy)
  }

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader title="冰箱" showBack />

      {(nearExpiryItems.length > 0 || expiredItems.length > 0) && (
        <div
          onClick={scrollToGrid}
          className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            {nearExpiryItems.length > 0 && `${nearExpiryItems.length}件临期`}
            {nearExpiryItems.length > 0 && expiredItems.length > 0 && '，'}
            {expiredItems.length > 0 && `${expiredItems.length}件已过期`}
          </span>
        </div>
      )}

      <div className="px-4 pt-3 pb-24">
        {borrowedItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2">共享物品借用</h3>
            <div className="space-y-2">
              {borrowedItems.map(item => {
                const borrower = item.borrowedBy ? getMemberById(item.borrowedBy) : undefined
                return (
                  <div key={item.id} className="bg-white rounded-xl p-3 shadow-soft flex items-center gap-3">
                    <Avatar memberId={item.borrowedBy} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {borrower?.name} 借用 · 预计 {item.borrowReturnDate} 归还
                      </p>
                    </div>
                    <button
                      onClick={() => handleReturn(item.id, item.borrowedBy!)}
                      className="px-3 py-1 bg-primary text-white text-xs rounded-lg font-medium active:scale-95 transition-transform"
                    >
                      归还
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div ref={gridRef}>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-2">食材列表</h3>
          <div className="grid grid-cols-2 gap-3">
            {fridge.map(item => {
              const isExpired = item.expiryDate ? getDaysUntil(item.expiryDate) <= 0 : false
              const isNearExpiry = item.expiryDate ? getDaysUntil(item.expiryDate) > 0 && getDaysUntil(item.expiryDate) <= 3 : false
              const ownership = OWNERSHIP_CONFIG[item.ownership]
              const emoji = CATEGORY_EMOJI[item.category] || '📦'

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3 shadow-soft ${
                    isNearExpiry ? 'border-2 border-red-400' : ''
                  } ${isExpired ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{emoji}</span>
                    {isExpired && (
                      <button
                        onClick={() => removeFridgeItem(item.id)}
                        className="p-0.5 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className={`text-sm font-medium mt-1 ${isExpired ? 'line-through text-gray-400' : 'text-[var(--color-text)]'}`}>
                    {item.name}
                  </p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mt-1 ${ownership.className}`}>
                    {ownership.label}
                  </span>
                  {item.expiryDate && (
                    <p className={`text-xs mt-1 ${isExpired ? 'text-red-400' : isNearExpiry ? 'text-red-500' : 'text-gray-400'}`}>
                      {isExpired ? '已过期' : isNearExpiry ? '临期' : ''} {item.expiryDate}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {fridge.length === 0 && (
            <div className="text-center py-12 text-gray-400">冰箱空空如也</div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-float flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-float" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--color-text)]">添加食材</h3>
              <button onClick={() => setShowAdd(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">名称</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="输入食材名称"
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">类别</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                        newCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-cream text-gray-500'
                      }`}
                    >
                      {CATEGORY_EMOJI[cat] || '📦'} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">归属</label>
                <div className="flex gap-2">
                  {(['shared', 'personal'] as const).map(type => {
                    const cfg = OWNERSHIP_CONFIG[type]
                    return (
                      <button
                        key={type}
                        onClick={() => setNewOwnership(type)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                          newOwnership === type
                            ? `${cfg.className} ring-2 ring-offset-1 ring-current`
                            : 'bg-cream text-gray-400'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">到期日期</label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={e => setNewExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
