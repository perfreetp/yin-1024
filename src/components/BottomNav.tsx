import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, ShoppingCart, Wallet, User, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/chores', icon: ClipboardList, label: '家务' },
  { to: '/checkin', icon: Sparkles, label: '打卡', center: true },
  { to: '/shopping', icon: ShoppingCart, label: '购物' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-lg border-t border-cream-dark z-50">
      <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {NAV_ITEMS.map(item => {
          const isActive = item.center
            ? false
            : location.pathname === item.to
          const Icon = item.icon

          if (item.center) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] mt-1 text-primary font-medium">{item.label}</span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center py-1.5 min-w-[48px]"
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`text-[10px] mt-0.5 transition-colors ${isActive ? 'text-primary font-medium' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
