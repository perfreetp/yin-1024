import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

const STATUS_CONFIG = {
  upcoming: { label: '即将到访', className: 'bg-secondary/15 text-secondary-dark' },
  visiting: { label: '在访', className: 'bg-green-100 text-green-600' },
  left: { label: '已离开', className: 'bg-gray-100 text-gray-400' },
}

const RELATION_OPTIONS = ['家人', '朋友', '同事', '其他']

function formatVisitDate(dateStr: string) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

export default function Visitors() {
  const visitors = useAppStore(s => s.visitors)
  const addVisitor = useAppStore(s => s.addVisitor)
  const updateVisitorStatus = useAppStore(s => s.updateVisitorStatus)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelation, setNewRelation] = useState('朋友')
  const [newVisitDate, setNewVisitDate] = useState('')

  const upcomingVisitors = visitors.filter(v => v.status === 'upcoming')
  const visitingVisitors = visitors.filter(v => v.status === 'visiting')
  const leftVisitors = visitors.filter(v => v.status === 'left')

  const activeVisitors = [...upcomingVisitors, ...visitingVisitors]

  const handleAdd = () => {
    if (!newName.trim()) return
    if (!newVisitDate) return

    addVisitor({
      houseId: 'h1',
      hostId: currentMemberId,
      visitorName: newName.trim(),
      relation: newRelation,
      visitDate: newVisitDate,
      status: 'upcoming',
    })

    setNewName('')
    setNewRelation('朋友')
    setNewVisitDate('')
    setShowAdd(false)
  }

  const handleStatusChange = (visitorId: string, status: 'upcoming' | 'visiting' | 'left') => {
    updateVisitorStatus(visitorId, status)
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader title="访客管理" showBack />

      <div className="px-4 pt-3 pb-24">
        {activeVisitors.length > 0 && (
          <div className="mb-6">
            <h2 className="section-title mb-3">当前访客</h2>
            <div className="space-y-3">
              {activeVisitors.map(visitor => {
                const statusConf = STATUS_CONFIG[visitor.status]
                const host = getMemberById(visitor.hostId)

                return (
                  <div key={visitor.id} className="bg-white rounded-2xl p-4 shadow-soft">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[var(--color-text)]">{visitor.visitorName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.className}`}>
                            {statusConf.label}
                          </span>
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                          关系：{visitor.relation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar memberId={visitor.hostId} size="sm" showName />
                        <span className="text-xs text-[var(--color-text-muted)]">接待</span>
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {formatVisitDate(visitor.visitDate)}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-cream-dark">
                      {visitor.status === 'upcoming' && (
                        <button
                          onClick={() => handleStatusChange(visitor.id, 'visiting')}
                          className="flex-1 py-1.5 bg-secondary/15 text-secondary-dark text-sm rounded-xl font-medium active:scale-95 transition-transform"
                        >
                          标记到访
                        </button>
                      )}
                      {visitor.status === 'visiting' && (
                        <button
                          onClick={() => handleStatusChange(visitor.id, 'left')}
                          className="flex-1 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-xl font-medium active:scale-95 transition-transform"
                        >
                          标记离开
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {leftVisitors.length > 0 && (
          <div>
            <h2 className="section-title mb-3">来访记录</h2>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {leftVisitors.map((visitor, i) => {
                const host = getMemberById(visitor.hostId)

                return (
                  <div
                    key={visitor.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i < leftVisitors.length - 1 ? 'border-b border-cream-dark' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        👤
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">
                          {visitor.visitorName}
                          <span className="text-xs text-[var(--color-text-muted)] ml-1.5">{visitor.relation}</span>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {host?.name} 接待 · {formatVisitDate(visitor.visitDate)}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                      已离开
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {visitors.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无访客记录</div>
        )}
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
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-float animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--color-text)]">报备访客</h3>
              <button onClick={() => setShowAdd(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">访客姓名</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="输入访客姓名"
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">关系</label>
                <div className="flex gap-2">
                  {RELATION_OPTIONS.map(rel => (
                    <button
                      key={rel}
                      onClick={() => setNewRelation(rel)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        newRelation === rel
                          ? 'bg-primary/15 text-primary ring-2 ring-offset-1 ring-primary'
                          : 'bg-cream text-gray-400'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">到访时间</label>
                <input
                  type="datetime-local"
                  value={newVisitDate}
                  onChange={e => setNewVisitDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newVisitDate}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
              >
                提交报备
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
