import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package, Users, Search, Bell, Menu, X, ShoppingCart, RotateCcw } from 'lucide-react'
import { StoreProvider, useStore } from '../data/store.jsx'

const NAV = [
  ['/', 'Overview', LayoutDashboard],
  ['/orders', 'Orders', ShoppingBag],
  ['/products', 'Products', Package],
  ['/customers', 'Customers', Users],
]

function Sidebar({ onNavigate }) {
  const { orders, reset } = useStore()
  const pending = orders.filter((o) => o.status === 'Pending').length
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-2">
        <span className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center"><ShoppingCart size={18} /></span>
        <b className="text-lg tracking-tight">Shopline</b>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">ADMIN</span>
      </div>
      <nav className="mt-8 space-y-1">
        {NAV.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-brand-600 text-white shadow-[0_2px_0_#3b25b8]' : 'text-slate-500 hover:bg-slate-100 hover:text-ink'}`}>
            <Icon size={18} />{label}
            {label === 'Orders' && pending > 0 && <span className="ml-auto text-[11px] px-1.5 rounded-md bg-amber-400 text-ink">{pending}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-ink p-4 text-white">
        <b className="text-sm">Demo data</b>
        <p className="text-xs text-white/80 mt-1">Changes are saved in your browser.</p>
        <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg"><RotateCcw size={12} />Reset data</button>
      </div>
    </div>
  )
}

function Shell() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const title = NAV.find(([to]) => to === pathname)?.[1] || 'Overview'
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-100 p-5 sticky top-0 h-screen"><Sidebar /></aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}>
          <aside className="w-72 h-full bg-white p-5" onClick={(e) => e.stopPropagation()}><Sidebar onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-[#f6f7fb] px-5 sm:px-8 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Open menu">{open ? <X /> : <Menu />}</button>
          <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
          <label className="hidden md:flex ml-auto items-center gap-2 bg-white rounded-xl px-3 py-2 w-72 border border-slate-100">
            <Search size={16} className="text-slate-400" /><input placeholder="Search orders, products…" className="outline-none text-sm flex-1 bg-transparent" />
          </label>
          <button className="ml-auto md:ml-0 relative p-2.5 rounded-xl bg-white border border-slate-100" aria-label="Notifications"><Bell size={18} /><span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" /></button>
          <span className="w-10 h-10 rounded-xl bg-[#ffe7b3] grid place-items-center font-bold text-[#7a4b00]">MA</span>
        </header>
        <main className="px-5 sm:px-8 pb-10"><Outlet /></main>
      </div>
    </div>
  )
}

export default function Layout() {
  return <StoreProvider><Shell /></StoreProvider>
}
