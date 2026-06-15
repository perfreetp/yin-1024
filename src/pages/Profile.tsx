import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Copy, Crown, Refrigerator, MessageSquare, Vote,
  UserRoundPlus, ScrollText, BookOpen, Plus, X, LogOut,
  Share2, Pencil, Check
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import Avatar from '@/components/Avatar'

const QUICK_ENTRIES = [
  { icon: Refrigerator, label: '冰箱管理', to: '/fridge', color: 'bg-blue-500' },
  { icon: MessageSquare, label: '群聊公告', to: '/chat', color: 'bg-[var(--color-secondary)]' },
  { icon: Vote, label: '投票决策', to: '/vote', color: 'bg-[var(--color-accent)]' },
  { icon: UserRoundPlus, label: '访客管理', to: '/visitors', color: 'bg-[var(--color-warning)]' },
  { icon: ScrollText, label: '房规设置', to: '', color: 'bg-orange-500', isRule: true },
  { icon: BookOpen, label: '账本管理', to: '/ledger', color: 'bg-[var(--color-primary)]' },
]

export default function Profile() {
  const navigate = useNavigate()
  const house = useAppStore(s => s.house)
  const members = useAppStore(s => s.members)
  const getCurrentMember = useAppStore(s => s.getCurrentMember)
  const updateHouseInfo = useAppStore(s => s.updateHouseInfo)
  const leaveHouse = useAppStore(s => s.leaveHouse)
  const currentMemberId = useAppStore(s => s.currentMemberId)

  const me = getCurrentMember()
  const isOwner = me.role === 'owner'

  const [toast, setToast] = useState('')
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editRules, setEditRules] = useState<string[]>([])
  const [newRule, setNewRule] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(house.inviteCode).then(() => {
      showToast('已复制邀请码')
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?invite=${house.inviteCode}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('已复制邀请链接')
    })
  }

  const handleOpenRuleModal = () => {
    setEditRules([...house.rules])
    setNewRule('')
    setShowRuleModal(true)
  }

  const handleAddRule = () => {
    const trimmed = newRule.trim()
    if (!trimmed) return
    setEditRules([...editRules, trimmed])
    setNewRule('')
  }

  const handleRemoveRule = (index: number) => {
    setEditRules(editRules.filter((_, i) => i !== index))
  }

  const handleSaveRules = () => {
    updateHouseInfo({ rules: editRules })
    setShowRuleModal(false)
    showToast('房规已更新')
  }

  const handleEntryClick = (entry: typeof QUICK_ENTRIES[0]) => {
    if (entry.isRule) {
      handleOpenRuleModal()
    }
  }

  const handleLeave = () => {
    leaveHouse()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="page-container space-y-4">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-text)] text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-4xl ring-4 ring-white shadow-md">
          {me.avatar}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--color-text)]">{me.name}</span>
          <span className={`badge ${me.role === 'owner' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]'}`}>
            {me.role === 'owner' ? '屋主' : '室友'}
          </span>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-[var(--color-text)]">{house.name}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{house.address}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title text-base mb-3">🏡 合租屋信息</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">屋名</span>
            <span className="text-sm font-medium text-[var(--color-text)]">{house.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">地址</span>
            <span className="text-sm font-medium text-[var(--color-text)]">{house.address}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">邀请码</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-wider text-[var(--color-primary)]">{house.inviteCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 active:scale-90 transition-transform"
              >
                <Copy className="w-4 h-4 text-[var(--color-primary)]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="section-title text-base mb-3">👥 室友列表</div>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="card flex items-center gap-3 !p-3">
              <Avatar memberId={member.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">{member.name}</span>
                  {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
              </div>
              <span className={`badge ${member.role === 'owner' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]'}`}>
                {member.role === 'owner' ? '屋主' : '室友'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-title text-base mb-3">⚡ 快捷入口</div>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ENTRIES.map(entry => {
            const content = (
              <div className="card flex items-center gap-3 !p-3 active:scale-[0.97] transition-transform cursor-pointer">
                <div className={`${entry.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
                  <entry.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">{entry.label}</span>
              </div>
            )
            if (entry.isRule) {
              return <div key={entry.label} onClick={() => handleEntryClick(entry)}>{content}</div>
            }
            return (
              <Link key={entry.label} to={entry.to}>
                {content}
              </Link>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-3 text-center text-[var(--color-danger)] font-medium text-sm active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
      >
        <LogOut className="w-4 h-4" />
        退出合租屋
      </button>

      {showRuleModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={() => setShowRuleModal(false)}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-2xl p-5 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="section-title text-base">📜 房规设置</span>
              <button onClick={() => setShowRuleModal(false)} className="p-1">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {editRules.length === 0 && (
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">暂无房规</div>
              )}
              {editRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2 bg-[var(--color-bg)] rounded-xl px-3 py-2.5">
                  <span className="text-xs text-[var(--color-text-muted)] w-5 shrink-0">{index + 1}.</span>
                  <span className="text-sm text-[var(--color-text)] flex-1">{rule}</span>
                  <button onClick={() => handleRemoveRule(index)} className="p-0.5">
                    <X className="w-4 h-4 text-[var(--color-danger)]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddRule()}
                placeholder="输入新规则"
                className="flex-1 bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-[var(--color-primary)] transition-colors"
              />
              <button
                onClick={handleAddRule}
                className="btn-primary !px-3 !py-2.5 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button onClick={handleSaveRules} className="btn-primary w-full">
              保存房规
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={() => setShowLogoutConfirm(false)}>
          <div
            className="bg-white rounded-2xl p-5 w-72 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-base font-bold text-[var(--color-text)] text-center mb-2">确认退出</div>
            <div className="text-sm text-[var(--color-text-secondary)] text-center mb-5">
              退出后将无法查看合租屋信息，确定要退出吗？
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-outline !py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 bg-[var(--color-danger)] text-white rounded-full py-2 text-sm font-medium active:scale-95 transition-transform"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
