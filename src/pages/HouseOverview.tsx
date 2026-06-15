import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy, Share2, Crown, Users, MapPin, ScrollText,
  Pencil, Check, X, Plus, LogOut, ArrowRight
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import Avatar from '@/components/Avatar'

export default function HouseOverview() {
  const navigate = useNavigate()
  const house = useAppStore(s => s.house)
  const members = useAppStore(s => s.members)
  const getCurrentMember = useAppStore(s => s.getCurrentMember)
  const updateHouseInfo = useAppStore(s => s.updateHouseInfo)
  const leaveHouse = useAppStore(s => s.leaveHouse)

  const me = getCurrentMember()
  const isOwner = me.role === 'owner'

  const [toast, setToast] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingRules, setEditingRules] = useState(false)
  const [tempName, setTempName] = useState(house.name)
  const [tempAddress, setTempAddress] = useState(house.address)
  const [tempRules, setTempRules] = useState<string[]>([...house.rules])
  const [newRule, setNewRule] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(house.inviteCode).then(() => {
      showToast('邀请码已复制')
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?invite=${house.inviteCode}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('邀请链接已复制')
    })
  }

  const handleSaveName = () => {
    if (!tempName.trim()) return
    updateHouseInfo({ name: tempName.trim() })
    setEditingName(false)
    showToast('屋名已更新')
  }

  const handleSaveAddress = () => {
    updateHouseInfo({ address: tempAddress.trim() })
    setEditingAddress(false)
    showToast('地址已更新')
  }

  const handleOpenRules = () => {
    setTempRules([...house.rules])
    setNewRule('')
    setEditingRules(true)
  }

  const handleAddRule = () => {
    const trimmed = newRule.trim()
    if (!trimmed) return
    setTempRules([...tempRules, trimmed])
    setNewRule('')
  }

  const handleRemoveRule = (index: number) => {
    setTempRules(tempRules.filter((_, i) => i !== index))
  }

  const handleSaveRules = () => {
    updateHouseInfo({ rules: tempRules })
    setEditingRules(false)
    showToast('房规已更新')
  }

  const handleLeave = () => {
    leaveHouse()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-text)] text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="bg-gradient-to-br from-primary to-primary-light text-white px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="text-center">
          <div className="text-5xl mb-3">🏡</div>
          <div className="flex items-center justify-center gap-2 mb-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="bg-white/20 text-white placeholder-white/60 px-3 py-1.5 rounded-lg text-xl font-bold text-center outline-none"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} className="p-1">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => { setEditingName(false); setTempName(house.name) }} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-black">{house.name}</h1>
                {isOwner && (
                  <button onClick={() => setEditingName(true)} className="p-1">
                    <Pencil className="w-4 h-4 text-white/70" />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-white/80 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {editingAddress ? (
              <div className="flex items-center gap-1">
                <input
                  value={tempAddress}
                  onChange={e => setTempAddress(e.target.value)}
                  placeholder="请输入地址"
                  className="bg-white/20 text-white placeholder-white/60 px-2 py-0.5 rounded text-sm outline-none w-40"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveAddress()}
                />
                <button onClick={handleSaveAddress} className="p-0.5">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditingAddress(false); setTempAddress(house.address) }} className="p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span>{house.address || '未设置地址'}</span>
                {isOwner && (
                  <button onClick={() => setEditingAddress(true)} className="p-1">
                    <Pencil className="w-3.5 h-3.5 text-white/70" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-container -mt-4 space-y-4">
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title text-base mb-0">🔑 邀请码</div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {members.length} 位室友
            </span>
          </div>

          <div className="bg-[var(--color-primary)]/5 rounded-2xl p-4 mb-3">
            <div className="text-center">
              <div className="text-4xl font-black tracking-[0.3em] text-[var(--color-primary)] mb-3">
                {house.inviteCode}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-[var(--color-primary)] text-sm font-medium active:scale-95 transition-transform"
                >
                  <Copy className="w-4 h-4" />
                  复制邀请码
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium active:scale-95 transition-transform"
                >
                  <Share2 className="w-4 h-4" />
                  复制链接
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] text-center">
            把邀请码发给室友，对方在 App 选择「加入合租屋」即可入住 🏠
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title text-base mb-0">📜 合租屋公约</div>
            {isOwner && (
              <button
                onClick={handleOpenRules}
                className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {house.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-primary)] mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
            {house.rules.length === 0 && (
              <li className="text-sm text-[var(--color-text-muted)] text-center py-2">
                暂无房规
              </li>
            )}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title text-base mb-0 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              室友列表
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {members.length} 人
            </span>
          </div>

          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar memberId={member.id} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {member.name}
                    </span>
                    {member.role === 'owner' && (
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                    {member.id === me.id && (
                      <span className="text-xs text-[var(--color-primary)]">（我）</span>
                    )}
                  </div>
                </div>
                <span className={`badge ${member.role === 'owner' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]'}`}>
                  {member.role === 'owner' ? '屋主' : '室友'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          进入首页
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 text-center text-[var(--color-danger)] font-medium text-sm active:opacity-70 transition-opacity"
        >
          退出合租屋
        </button>
      </div>

      {editingRules && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={() => setEditingRules(false)}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-2xl p-5 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="section-title text-base">📜 编辑房规</span>
              <button onClick={() => setEditingRules(false)} className="p-1">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {tempRules.length === 0 && (
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">暂无房规</div>
              )}
              {tempRules.map((rule, index) => (
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
                className="flex-1 py-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium active:scale-95 transition-transform"
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
