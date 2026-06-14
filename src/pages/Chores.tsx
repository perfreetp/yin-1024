import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function getWeekDates(): Date[] {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function Chores() {
  const chores = useAppStore(s => s.chores)
  const shifts = useAppStore(s => s.shifts)
  const members = useAppStore(s => s.members)
  const house = useAppStore(s => s.house)
  const addShiftRequest = useAppStore(s => s.addShiftRequest)
  const updateShiftStatus = useAppStore(s => s.updateShiftStatus)
  const toggleChoreComplete = useAppStore(s => s.toggleChoreComplete)
  const addChoreCheckin = useAppStore(s => s.addChoreCheckin)
  const getMemberById = useAppStore(s => s.getMemberById)

  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formTargetId, setFormTargetId] = useState('')
  const [formReason, setFormReason] = useState('')

  const currentMemberId = useAppStore(s => s.currentMemberId)
  const weekDates = getWeekDates()
  const todayStr = formatDate(new Date())

  const pendingShifts = shifts.filter(s => s.status === 'pending')

  const handleSubmitShift = () => {
    if (!formDate || !formTargetId || !formReason.trim()) return
    addShiftRequest({
      houseId: house.id,
      requesterId: currentMemberId,
      targetId: formTargetId,
      date: formDate,
      reason: formReason.trim(),
    })
    setShowForm(false)
    setFormDate('')
    setFormTargetId('')
    setFormReason('')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <PageHeader title="家务板" />

      <div className="page-container">
        <section className="mb-5">
          <div
            className="border-2 border-orange-400 bg-orange-50 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className="font-bold text-orange-700">🏠 房规须知</span>
              <span className="text-orange-500 text-sm">
                {expanded ? '收起 ▲' : '展开 ▼'}
              </span>
            </button>
            {expanded && (
              <ul className="px-4 pb-3 space-y-1.5">
                {house.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="section-title mb-3">📅 本周排班</h2>
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {weekDates.map(date => {
                const dateStr = formatDate(date)
                const isToday = dateStr === todayStr
                const dayChores = chores.filter(c => c.date === dateStr)

                return (
                  <div
                    key={dateStr}
                    className={`flex-shrink-0 w-[100px] rounded-xl p-3 text-center transition-all ${
                      isToday
                        ? 'bg-[var(--color-primary)] text-white shadow-lg scale-105'
                        : 'bg-white border border-[var(--color-border)]'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                      {WEEKDAYS[date.getDay()]}
                    </div>
                    <div className={`text-lg font-bold mb-2 ${isToday ? 'text-white' : 'text-[var(--color-text)]'}`}>
                      {date.getDate()}
                    </div>
                    {dayChores.length > 0 ? (
                      <div className="space-y-1.5">
                        {dayChores.map(chore => (
                          <div key={chore.id} className="flex flex-col items-center gap-0.5">
                            <div className={chore.completed && !isToday ? 'opacity-50' : ''}>
                              <Avatar memberId={chore.memberId} size="sm" />
                            </div>
                            <span className={`text-[10px] truncate w-full ${isToday ? 'text-white/90' : 'text-[var(--color-text-secondary)]'} ${chore.completed ? 'line-through' : ''}`}>
                              {chore.choreType}
                            </span>
                            {chore.completed && (
                              <span className={`text-[10px] ${isToday ? 'text-green-200' : 'text-[var(--color-success)]'}`}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-[10px] ${isToday ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
                        暂无
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mb-5">
          <h2 className="section-title mb-3">🔄 换班申请</h2>
          {pendingShifts.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-[var(--color-border)]">
              <span className="text-3xl mb-2 block">🎉</span>
              <p className="text-sm text-[var(--color-text-muted)]">暂无待处理的换班申请</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingShifts.map(shift => {
                const requester = getMemberById(shift.requesterId)
                const target = getMemberById(shift.targetId)
                return (
                  <div key={shift.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar memberId={shift.requesterId} size="sm" showName />
                        <span className="text-sm text-[var(--color-text-secondary)]">→</span>
                        <Avatar memberId={shift.targetId} size="sm" showName />
                      </div>
                      <span className="badge-pending">待处理</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                      {requester?.name} 想与 {target?.name} 换班
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">
                      日期：{shift.date}｜原因：{shift.reason}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateShiftStatus(shift.id, 'approved')}
                        className="flex-1 py-2 rounded-lg bg-[var(--color-success)] text-white text-sm font-medium active:scale-95 transition-transform"
                      >
                        同意
                      </button>
                      <button
                        onClick={() => updateShiftStatus(shift.id, 'rejected')}
                        className="flex-1 py-2 rounded-lg bg-[var(--color-danger)] text-white text-sm font-medium active:scale-95 transition-transform"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title mb-3">✅ 今日家务</h2>
          <div className="space-y-2">
            {chores.filter(c => c.date === todayStr).map(chore => {
              const member = getMemberById(chore.memberId)
              return (
                <div
                  key={chore.id}
                  className={`card flex items-center justify-between ${chore.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar memberId={chore.memberId} size="sm" />
                    <div>
                      <p className={`text-sm font-medium ${chore.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                        {chore.choreType}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {member?.name} · {chore.completed ? '已完成' : '未完成'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleChoreComplete(chore.id)
                      if (!chore.completed) addChoreCheckin(chore.id)
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-90 ${
                      chore.completed
                        ? 'bg-[var(--color-success)] text-white'
                        : 'border-2 border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {chore.completed ? '✓' : ''}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-4 btn-primary w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg z-30"
      >
        📝
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-2xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--color-text)]">请假换班</h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-text-muted)] text-xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">选择日期</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">换班对象</label>
                <select
                  value={formTargetId}
                  onChange={e => setFormTargetId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">请选择室友</option>
                  {members
                    .filter(m => m.id !== currentMemberId)
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">换班原因</label>
                <textarea
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="请输入换班原因..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <button
                onClick={handleSubmitShift}
                disabled={!formDate || !formTargetId || !formReason.trim()}
                className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
