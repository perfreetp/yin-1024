import { useState } from 'react'
import { Plus, Camera, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

type FilterType = 'all' | 'pending' | 'purchased'

const URGENCY_CONFIG = {
  high: { label: '高', className: 'bg-red-100 text-red-600' },
  medium: { label: '中', className: 'bg-yellow-100 text-yellow-600' },
  low: { label: '低', className: 'bg-green-100 text-green-600' },
}

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待购' },
  { key: 'purchased', label: '已购' },
]

export default function Shopping() {
  const shopping = useAppStore(s => s.shopping)
  const addShoppingItem = useAppStore(s => s.addShoppingItem)
  const toggleShoppingPurchased = useAppStore(s => s.toggleShoppingPurchased)
  const removeShoppingItem = useAppStore(s => s.removeShoppingItem)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)

  const [filter, setFilter] = useState<FilterType>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrgency, setNewUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [priceInput, setPriceInput] = useState('')

  const filtered = shopping.filter(item => {
    if (filter === 'pending') return !item.purchased
    if (filter === 'purchased') return item.purchased
    return true
  })

  const handleAdd = () => {
    if (!newName.trim()) return
    addShoppingItem({
      houseId: 'h1',
      name: newName.trim(),
      addedBy: currentMemberId,
      urgency: newUrgency,
      purchased: false,
    })
    setNewName('')
    setNewUrgency('medium')
    setShowAdd(false)
  }

  const handleMarkPurchased = (itemId: string) => {
    const price = parseFloat(priceInput)
    if (isNaN(price) || price <= 0) return
    toggleShoppingPurchased(itemId, price)
    setMarkingId(null)
    setPriceInput('')
  }

  const handlePhotoAdd = () => {
    addShoppingItem({
      houseId: 'h1',
      name: '缺货商品（拍照）',
      addedBy: currentMemberId,
      urgency: 'high',
      purchased: false,
    })
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="购物清单"
        showBack
        right={
          <button onClick={handlePhotoAdd} className="p-1 active:scale-90 transition-transform">
            <Camera className="w-5 h-5 text-primary" />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-24">
        <div className="flex gap-2 mb-4">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === opt.key
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-[var(--color-text)] shadow-soft'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(item => {
            const urgency = URGENCY_CONFIG[item.urgency]
            const purchaser = item.purchasedBy ? getMemberById(item.purchasedBy) : undefined

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 shadow-soft transition-opacity ${
                  item.purchased ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!item.purchased) {
                        setMarkingId(item.id)
                      }
                    }}
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      item.purchased
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.purchased && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${item.purchased ? 'line-through text-gray-400' : 'text-[var(--color-text)]'}`}>
                        {item.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${urgency.className}`}>
                        {urgency.label}
                      </span>
                    </div>

                    {item.purchased && purchaser && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Avatar memberId={item.purchasedBy} size="sm" />
                        <span className="text-sm text-gray-500">
                          {purchaser.name} 购买
                        </span>
                        {item.price != null && (
                          <span className="text-sm font-medium text-primary">
                            ¥{item.price.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {markingId === item.id && (
                  <div className="mt-3 pt-3 border-t border-cream-dark flex items-center gap-2">
                    <span className="text-sm text-gray-500">金额：</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      placeholder="输入购买金额"
                      className="flex-1 px-3 py-1.5 bg-cream rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => handleMarkPurchased(item.id)}
                      className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium active:scale-95 transition-transform"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => { setMarkingId(null); setPriceInput('') }}
                      className="px-3 py-1.5 bg-cream-dark text-gray-500 text-sm rounded-lg font-medium active:scale-95 transition-transform"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {filter === 'pending' ? '没有待购商品' : filter === 'purchased' ? '没有已购商品' : '购物清单为空'}
            </div>
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
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-float"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--color-text)]">添加购物项</h3>
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
                  placeholder="输入商品名称"
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">紧急程度</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(level => {
                    const cfg = URGENCY_CONFIG[level]
                    return (
                      <button
                        key={level}
                        onClick={() => setNewUrgency(level)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                          newUrgency === level
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
