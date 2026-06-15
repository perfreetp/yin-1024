import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Send, Megaphone, AlertCircle, Wallet } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/PageHeader'
import Avatar from '@/components/Avatar'

export default function Chat() {
  const messages = useAppStore(s => s.messages)
  const announcements = useAppStore(s => s.announcements)
  const expenses = useAppStore(s => s.expenses)
  const sendMessage = useAppStore(s => s.sendMessage)
  const markAnnouncementRead = useAppStore(s => s.markAnnouncementRead)
  const getMemberById = useAppStore(s => s.getMemberById)
  const currentMemberId = useAppStore(s => s.currentMemberId)
  const settleExpenseSplit = useAppStore(s => s.settleExpenseSplit)
  const members = useAppStore(s => s.members)

  const [inputValue, setInputValue] = useState('')
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return
    sendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAnnouncementPointerDown = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      markAnnouncementRead(id)
    }, 500)
  }

  const handleAnnouncementPointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null

  const myUnpaidBills = expenses.filter(e => !e.settled).flatMap(e =>
    e.splits.filter(s => s.memberId === currentMemberId && !s.paid).map(s => ({
      expenseId: e.id,
      description: e.description,
      amount: s.amount,
      payerId: e.payerId,
    }))
  )

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="h-screen flex flex-col bg-cream">
      <PageHeader title="群聊" showBack />

      {latestAnnouncement && (
        <div className="bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
          <div
            onClick={() => setShowAnnouncements(!showAnnouncements)}
            className="px-4 py-2.5 flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="flex-1 text-sm text-yellow-800 truncate">{latestAnnouncement.content}</p>
            {showAnnouncements ? (
              <ChevronUp className="w-4 h-4 text-yellow-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-yellow-600" />
            )}
          </div>

          {showAnnouncements && (
            <div className="px-4 pb-3 space-y-2">
              {announcements.map(ann => {
                const author = getMemberById(ann.authorId)
                const isRead = ann.readBy.includes(currentMemberId)
                return (
                  <div
                    key={ann.id}
                    onPointerDown={() => handleAnnouncementPointerDown(ann.id)}
                    onPointerUp={handleAnnouncementPointerCancel}
                    onPointerLeave={handleAnnouncementPointerCancel}
                    className={`p-2.5 rounded-lg text-sm select-none ${
                      isRead ? 'bg-white' : 'bg-yellow-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[var(--color-text)]">{author?.name}</span>
                      <span className="text-xs text-gray-400">{formatTime(ann.createdAt)}</span>
                    </div>
                    <p className="text-gray-600">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-1">已读 {ann.readBy.length}/{members.length}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {myUnpaidBills.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 flex-shrink-0">
          <Link to="/ledger" className="block">
            <div className="px-4 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className="w-4 h-4 text-[var(--color-danger)] flex-shrink-0" />
                <span className="text-sm font-bold text-[var(--color-danger)]">
                  你有 {myUnpaidBills.length} 笔待付款
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--color-danger)] ml-auto" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {myUnpaidBills.slice(0, 3).map((bill, i) => {
                  const payer = getMemberById(bill.payerId)
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0 bg-white rounded-lg px-3 py-2 flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault()
                        settleExpenseSplit(bill.expenseId, currentMemberId)
                      }}
                    >
                      <div className="text-xs">
                        <p className="text-[var(--color-text)] font-medium truncate max-w-[80px]">{bill.description}</p>
                        <p className="text-[var(--color-text-muted)]">垫付：{payer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--color-danger)] font-bold text-sm">¥{bill.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-[var(--color-primary)]">点我结算</p>
                      </div>
                    </div>
                  )
                })}
                {myUnpaidBills.length > 3 && (
                  <div className="flex-shrink-0 bg-white/60 rounded-lg px-3 py-2 flex items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">+{myUnpaidBills.length - 3} 更多</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          {messages.map(msg => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-gray-400 bg-cream-dark/50 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              )
            }

            const isMine = msg.senderId === currentMemberId
            const sender = getMemberById(msg.senderId)

            if (isMine) {
              return (
                <div key={msg.id} className="flex justify-end gap-2">
                  <div className="max-w-[70%]">
                    <div className="bg-primary text-white rounded-2xl rounded-br-sm px-3 py-2">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-0.5">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              )
            }

            return (
              <div key={msg.id} className="flex gap-2">
                <Avatar memberId={msg.senderId} size="sm" />
                <div className="max-w-[70%]">
                  <p className="text-xs text-gray-500 mb-0.5">{sender?.name}</p>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-soft">
                    <p className="text-sm text-[var(--color-text)]">{msg.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-cream-dark px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 bg-cream rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 disabled:active:scale-100"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
