import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
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

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cream">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chores" element={<Chores />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/fridge" element={<Fridge />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkin" element={<Checkin />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  )
}
