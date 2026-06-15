import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Home, Users, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const AVATARS = ['🧑', '👩', '👨', '👩‍🦰', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👨‍🦰']

export default function CreateHouse() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createHouse = useAppStore(s => s.createHouse)
  const joinHouse = useAppStore(s => s.joinHouse)

  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [houseName, setHouseName] = useState('')
  const [address, setAddress] = useState('')
  const [userName, setUserName] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [withSample, setWithSample] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    const code = searchParams.get('invite')
    if (code) {
      setInviteCode(code.toUpperCase())
      setMode('join')
    }
  }, [searchParams])

  const handleCreate = () => {
    if (!houseName.trim() || !userName.trim()) return
    createHouse(houseName.trim(), address.trim(), userName.trim(), avatar, withSample)
    navigate('/overview', { replace: true })
  }

  const handleJoin = () => {
    if (!inviteCode.trim() || !userName.trim()) return
    const ok = joinHouse(inviteCode.trim(), userName.trim(), avatar)
    if (ok) {
      navigate('/overview', { replace: true })
    } else {
      setJoinError('邀请码无效，请确认后重试')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏡</div>
          <h1 className="text-2xl font-black text-[var(--color-text)]">同居记</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">让合租生活少扯皮、多留痕</p>
        </div>

        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-soft">
          <button
            onClick={() => { setMode('create'); setJoinError('') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'create' ? 'bg-primary text-white shadow-sm' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Home className="w-4 h-4" />
            创建合租屋
          </button>
          <button
            onClick={() => { setMode('join'); setJoinError('') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'join' ? 'bg-secondary text-white shadow-sm' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            加入合租屋
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">选择头像</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    avatar === a ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">你的名字</label>
            <input
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="室友们怎么叫你？"
              className="w-full px-4 py-2.5 bg-white rounded-xl text-sm outline-none border border-cream-dark focus:border-primary transition-colors"
            />
          </div>

          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">屋名</label>
                <input
                  value={houseName}
                  onChange={e => setHouseName(e.target.value)}
                  placeholder="给合租屋起个名字"
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-sm outline-none border border-cream-dark focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">地址</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="小区和门牌号（选填）"
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-sm outline-none border border-cream-dark focus:border-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setWithSample(!withSample)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    withSample ? 'bg-primary text-white' : 'border-2 border-cream-dark'
                  }`}
                >
                  {withSample && <span className="text-xs">✓</span>}
                </button>
                <span className="text-sm text-[var(--color-text-secondary)]">加载示例数据（体验完整功能）</span>
              </div>
              <button
                onClick={handleCreate}
                disabled={!houseName.trim() || !userName.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
              >
                创建合租屋 <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {mode === 'join' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">邀请码</label>
                <input
                  value={inviteCode}
                  onChange={e => { setInviteCode(e.target.value.toUpperCase()); setJoinError('') }}
                  placeholder="输入6位邀请码"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-sm tracking-widest text-center font-bold outline-none border border-cream-dark focus:border-secondary transition-colors"
                />
              </div>
              {joinError && (
                <p className="text-xs text-[var(--color-danger)] text-center">{joinError}</p>
              )}
              <button
                onClick={handleJoin}
                disabled={!inviteCode.trim() || !userName.trim()}
                className="w-full bg-secondary text-white rounded-full px-6 py-2.5 font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
              >
                加入合租屋 <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
