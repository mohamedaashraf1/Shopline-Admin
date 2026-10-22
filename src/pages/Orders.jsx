import { useState } from 'react'
import { Search, X, CreditCard, Banknote } from 'lucide-react'
import { useStore, money, STATUS_TONE, ICONS } from '../data/store.jsx'

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered']

export default function Orders() {
  const { orders, customers, products, setOrderStatus } = useStore()
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const cust = (id) => customers.find((c) => c.id === id)

  const rows = orders
    .filter((o) => tab === 'All' || o.status === tab)
    .filter((o) => !q || o.id.includes(q) || cust(o.customer)?.name.toLowerCase().includes(q.toLowerCase()))
  const cur = orders.find((o) => o.id === sel)

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="p-5 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${tab === t ? 'bg-ink text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {t} <span className="opacity-60">{t === 'All' ? orders.length : orders.filter((o) => o.status === t).length}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order # or customer" className="outline-none text-sm" /></label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr>{['Order', 'Customer', 'Date', 'Payment', 'Status', 'Total'].map((h) => <th key={h} className={`px-5 py-3 font-semibold ${h === 'Total' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((o) => {
              const c = cust(o.customer)
              return (
                <tr key={o.id} onClick={() => setSel(o.id)} className="border-t border-slate-100 hover:bg-brand-50/50 cursor-pointer">
                  <td className="px-5 py-3.5 font-bold">{o.id}</td>
                  <td className="px-5 py-3.5"><b className="block">{c?.name}</b><span className="text-xs text-slate-500">{c?.city}</span></td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{new Date(o.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{o.payment}</td>
                  <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_TONE[o.status]}`}>{o.status}</span></td>
                  <td className="px-5 py-3.5 text-right font-bold">{money(o.total)}</td>
                </tr>
              )
            })}
            {!rows.length && <tr><td colSpan={6} className="text-center py-12 text-slate-400">No orders match your filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {cur && (
        <div className="fixed inset-0 z-50 bg-ink/30" onClick={() => setSel(null)}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div><p className="text-sm text-slate-500">Order</p><h2 className="text-2xl font-extrabold">{cur.id}</h2></div>
              <button onClick={() => setSel(null)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Progress</p>
              <ol className="mt-3 flex gap-1.5">
                {FLOW.map((s, i) => <li key={s} className="flex-1"><div className={`h-1.5 rounded-full ${cur.status !== 'Cancelled' && FLOW.indexOf(cur.status) >= i ? 'bg-brand-600' : 'bg-slate-200'}`} /><span className="text-[11px] text-slate-500">{s}</span></li>)}
              </ol>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
              <b>{cust(cur.customer)?.name}</b>
              <p className="text-slate-500">{cust(cur.customer)?.email}</p>
              <p className="mt-2 flex items-center gap-2">{cur.payment === 'Card' ? <CreditCard size={16} /> : <Banknote size={16} />}{cur.payment}</p>
            </div>
            <ul className="mt-6 space-y-3">
              {cur.lines.map((l, i) => {
                const p = products.find((x) => x.id === l.pid); const Icon = ICONS[p?.icon] || X
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className={`w-11 h-11 rounded-xl grid place-items-center ${p?.tone || 'bg-slate-100'}`}><Icon size={20} /></span>
                    <div className="flex-1"><b className="text-sm">{p?.name || 'Removed product'}</b><p className="text-xs text-slate-500">{l.qty} × {money(l.price)}</p></div>
                    <b className="text-sm">{money(l.qty * l.price)}</b>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between font-extrabold"><span>Total</span><span>{money(cur.total)}</span></div>
            <p className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-wide">Update status</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[...FLOW, 'Cancelled'].map((s) => <button key={s} disabled={cur.status === s} onClick={() => setOrderStatus(cur.id, s)} className="py-2 rounded-xl border border-slate-200 text-sm font-bold disabled:bg-brand-600 disabled:text-white disabled:border-brand-600 hover:border-brand-500">{s}</button>)}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
