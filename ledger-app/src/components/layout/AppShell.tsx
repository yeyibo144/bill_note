import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import Toaster from '@/components/Toaster'

/**
 * Responsive app shell:
 * - < md: 420px centered column + fixed bottom tab bar (mockup layout)
 * - >= md: sidebar navigation + wide multi-column page layouts
 */
export default function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar />
      <main className="md:pl-64">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <TabBar />
      <Toaster />
    </div>
  )
}
