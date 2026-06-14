import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import type { ChoreSchedule } from '@/types'

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#FFA502', '#2ED573', '#FF9FF3']

function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
  return (
    <div
      className="absolute w-3 h-3 rounded-sm animate-confetti"
      style={{
        left: `${left}%`,
        top: '40%',
        animationDelay: `${delay}ms`,
        backgroundColor: color,
      }}
    />
  )
}

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      delay: i * 60,
      left: Math.random() * 90 + 5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
  [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(p => (
        <ConfettiPiece key={p.id} delay={p.delay} left={p.left} color={p.color} />
      ))}
    </div>
  )
}

export default function Checkin() {
  const navigate = useNavigate()
  const getCurrentMember = useAppStore(s => s.getCurrentMember)
  const chores = useAppStore(s => s.chores)
  const addChoreCheckin = useAppStore(s => s.addChoreCheckin)

  const me = getCurrentMember()
  const today = new Date().toISOString().slice(0, 10)

  const myTodayChores = chores.filter(
    c => c.memberId === me.id && c.date === today
  )

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const preChecked = new Set(myTodayChores.filter(c => c.completed).map(c => c.id))
    setCheckedIds(preChecked)
  }, [chores])

  const allDone = myTodayChores.length > 0 && myTodayChores.every(c => checkedIds.has(c.id))

  useEffect(() => {
    if (allDone && myTodayChores.length > 0) {
      const timer = setTimeout(() => setShowConfetti(true), 300)
      return () => clearTimeout(timer)
    }
    setShowConfetti(false)
  }, [allDone])

  function handleCheckin(chore: ChoreSchedule) {
    if (checkedIds.has(chore.id)) return
    setAnimatingId(chore.id)
    addChoreCheckin(chore.id)
    setTimeout(() => {
      setCheckedIds(prev => new Set(prev).add(chore.id))
      setAnimatingId(null)
    }, 400)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <PageHeader title="清洁打卡" showBack />

      <div className="page-container space-y-3">
        {myTodayChores.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-[var(--color-text-secondary)]">今天没有家务任务</div>
            <button
              className="btn-primary mt-4 text-sm"
              onClick={() => navigate(-1)}
            >
              返回首页
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-[var(--color-text-secondary)] mb-1">
              今日共 {myTodayChores.length} 项任务，已完成 {myTodayChores.filter(c => checkedIds.has(c.id)).length} 项
            </div>

            {myTodayChores.map(chore => {
              const isChecked = checkedIds.has(chore.id)
              const isAnimating = animatingId === chore.id

              return (
                <div
                  key={chore.id}
                  className={`card flex items-center justify-between transition-all duration-300 ${
                    isChecked ? 'bg-green-50 border-green-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      isChecked ? 'bg-green-100' : 'bg-[var(--color-primary)]/10'
                    }`}>
                      {isChecked ? '✅' : '🧹'}
                    </div>
                    <div>
                      <div className={`font-medium ${isChecked ? 'text-green-700 line-through' : 'text-[var(--color-text)]'}`}>
                        {chore.choreType}清洁
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">{chore.date}</div>
                    </div>
                  </div>

                  {isChecked ? (
                    <div className={`text-2xl transition-all duration-300 ${
                      isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                    }`}>
                      ✓
                    </div>
                  ) : (
                    <button
                      className="btn-primary text-xs !px-4 !py-1.5 active:scale-90 transition-transform"
                      onClick={() => handleCheckin(chore)}
                    >
                      完成打卡
                    </button>
                  )}
                </div>
              )
            })}

            {allDone && (
              <div className="card text-center py-8 animate-slide-up">
                <div className="text-5xl mb-3">🏆</div>
                <div className="text-xl font-bold text-[var(--color-text)] mb-1">全部完成！</div>
                <div className="text-sm text-[var(--color-text-secondary)]">太棒了，今天的家务都搞定了</div>
              </div>
            )}
          </>
        )}
      </div>

      {showConfetti && <Confetti />}
    </div>
  )
}
