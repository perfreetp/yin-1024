import { useState, useEffect } from 'react'
import { Plus, X, Clock, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

const TYPE_CONFIG = {
  quiet_hours: { label: '安静时段', className: 'bg-accent/15 text-accent-dark' },
  general: { label: '公共事务', className: 'bg-secondary/15 text-secondary-dark' },
}

function Countdown({ deadline }: { deadline: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setText('已截止')
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      if (days > 0) setText(`${days}天${hours}小时后截止`)
      else if (hours > 0) setText(`${hours}小时${minutes}分钟后截止`)
      else setText(`${minutes}分钟后截止`)
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [deadline])

  return (
    <span className="text-xs text-[var(--color-text-muted)]">{text}</span>
  )
}

export default function Vote() {
  const votes = useAppStore(s => s.votes)
  const members = useAppStore(s => s.members)
  const addVote = useAppStore(s => s.addVote)
  const castVote = useAppStore(s => s.castVote)
  const currentMemberId = useAppStore(s => s.currentMemberId)
  const getMemberById = useAppStore(s => s.getMemberById)

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'quiet_hours' | 'general'>('general')
  const [newOptions, setNewOptions] = useState(['', ''])
  const [newDeadline, setNewDeadline] = useState('')
  const [newAnonymous, setNewAnonymous] = useState(false)

  const hasVoted = (vote: typeof votes[0]) =>
    vote.options.some(opt => opt.votes.includes(currentMemberId))

  const myOptionIndex = (vote: typeof votes[0]) =>
    vote.options.findIndex(opt => opt.votes.includes(currentMemberId))

  const totalVotes = (vote: typeof votes[0]) =>
    vote.options.reduce((sum, opt) => sum + opt.votes.length, 0)

  const handleVote = (voteId: string, optionIndex: number) => {
    castVote(voteId, optionIndex)
  }

  const addOptionField = () => {
    setNewOptions(prev => [...prev, ''])
  }

  const removeOptionField = (index: number) => {
    if (newOptions.length <= 2) return
    setNewOptions(prev => prev.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    setNewOptions(prev => prev.map((o, i) => i === index ? value : o))
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const validOptions = newOptions.filter(o => o.trim())
    if (validOptions.length < 2) return
    if (!newDeadline) return

    addVote({
      houseId: 'h1',
      createdBy: currentMemberId,
      title: newTitle.trim(),
      type: newType,
      deadline: newDeadline,
      anonymous: newAnonymous,
      options: validOptions.map(label => ({ label, votes: [] })),
    })

    setNewTitle('')
    setNewType('general')
    setNewOptions(['', ''])
    setNewDeadline('')
    setNewAnonymous(false)
    setShowAdd(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader title="投票" showBack />

      <div className="px-4 pt-3 pb-24 space-y-4">
        {votes.map(vote => {
          const typeConf = TYPE_CONFIG[vote.type]
          const voted = hasVoted(vote)
          const myIdx = myOptionIndex(vote)
          const total = totalVotes(vote)
          const creator = getMemberById(vote.createdBy)
          const isExpired = new Date(vote.deadline).getTime() < Date.now()

          return (
            <div key={vote.id} className="bg-white rounded-2xl p-4 shadow-soft">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--color-text)]">{vote.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeConf.className}`}>
                      {typeConf.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    {creator && <Avatar memberId={vote.createdBy} size="sm" />}
                    <span>{creator?.name} 发起</span>
                    <span>·</span>
                    <span>{total}人参与</span>
                    {vote.anonymous && <span>· 匿名投票</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {vote.options.map((opt, i) => {
                  const count = opt.votes.length
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0
                  const isMyVote = myIdx === i
                  const canVote = !voted && !isExpired

                  return (
                    <button
                      key={i}
                      onClick={() => canVote ? handleVote(vote.id, i) : undefined}
                      disabled={!canVote}
                      className={`w-full text-left rounded-xl p-3 transition-all relative overflow-hidden ${
                        isMyVote
                          ? 'ring-2 ring-primary bg-primary/5'
                          : canVote
                            ? 'bg-cream hover:bg-cream-dark active:scale-[0.99]'
                            : 'bg-cream'
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-primary/10 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isMyVote && <Check className="w-4 h-4 text-primary" />}
                          <span className={`text-sm font-medium ${isMyVote ? 'text-primary' : 'text-[var(--color-text)]'}`}>
                            {opt.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-cream-dark rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: isMyVote ? 'var(--color-primary)' : 'var(--color-secondary)',
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)] w-14 text-right">
                            {count}票 {percent}%
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <Countdown deadline={vote.deadline} />
              </div>
            </div>
          )
        })}

        {votes.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无投票</div>
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
              <h3 className="text-lg font-bold text-[var(--color-text)]">发起投票</h3>
              <button onClick={() => setShowAdd(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">标题</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="输入投票标题"
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">类型</label>
                <div className="flex gap-2">
                  {(['quiet_hours', 'general'] as const).map(t => {
                    const conf = TYPE_CONFIG[t]
                    return (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                          newType === t
                            ? `${conf.className} ring-2 ring-offset-1 ring-current`
                            : 'bg-cream text-gray-400'
                        }`}
                      >
                        {conf.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-500">选项</label>
                  <button
                    onClick={addOptionField}
                    className="text-xs text-primary font-medium"
                  >
                    + 添加选项
                  </button>
                </div>
                <div className="space-y-2">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        placeholder={`选项 ${i + 1}`}
                        className="flex-1 px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {newOptions.length > 2 && (
                        <button
                          onClick={() => removeOptionField(i)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">截止日期</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-gray-500">匿名投票</span>
                <button
                  onClick={() => setNewAnonymous(!newAnonymous)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    newAnonymous ? 'bg-primary' : 'bg-cream-dark'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      newAnonymous ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || newOptions.filter(o => o.trim()).length < 2 || !newDeadline}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
              >
                发起投票
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
