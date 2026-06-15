import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import { useAppStore, useBroadcastSync, preloadHouseFromHash } from '@/store/useAppStore'
import CreateHouse from '@/pages/CreateHouse'
import HouseOverview from '@/pages/HouseOverview'
import Home from '@/pages/Home'
import Chores from '@/pages/Chores'
import Shopping from '@/pages/Shopping'
import Ledger from '@/pages/Ledger'
import Fridge from '@/pages/Fridge'
import Chat from '@/pages/Chat'
import Vote from '@/pages/Vote'
import Visitors from '@/pages/Visitors'
import Profile from '@/pages/Profile'
import Checkin from '@/pages/Checkin'

function HouseGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const hasHouse = useAppStore(s => s.hasHouse)
  if (!hasHouse()) {
    const params = new URLSearchParams(location.search)
    const invite = params.get('invite')
    const hash = location.hash
    let to = '/welcome'
    if (invite) to = `/welcome?invite=${invite}`
    if (hash) to = to + hash
    return <Navigate to={to} replace />
  }
  return <>{children}</>
}

export default function App() {
  useBroadcastSync()

  useEffect(() => {
    preloadHouseFromHash()
  }, [])

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cream">
        <div className="flex-1">
          <Routes>
            <Route path="/welcome" element={<CreateHouse />} />
            <Route path="/overview" element={<HouseGuard><HouseOverview /></HouseGuard>} />
            <Route path="/" element={<HouseGuard><Home /></HouseGuard>} />
            <Route path="/chores" element={<HouseGuard><Chores /></HouseGuard>} />
            <Route path="/shopping" element={<HouseGuard><Shopping /></HouseGuard>} />
            <Route path="/ledger" element={<HouseGuard><Ledger /></HouseGuard>} />
            <Route path="/fridge" element={<HouseGuard><Fridge /></HouseGuard>} />
            <Route path="/chat" element={<HouseGuard><Chat /></HouseGuard>} />
            <Route path="/vote" element={<HouseGuard><Vote /></HouseGuard>} />
            <Route path="/visitors" element={<HouseGuard><Visitors /></HouseGuard>} />
            <Route path="/profile" element={<HouseGuard><Profile /></HouseGuard>} />
            <Route path="/checkin" element={<HouseGuard><Checkin /></HouseGuard>} />
          </Routes>
        </div>
        <HouseGuard><BottomNav /></HouseGuard>
      </div>
    </Router>
  )
}
