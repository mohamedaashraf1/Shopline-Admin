import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { useStore, money } from '../data/store.jsx'

export default function Customers() {
  const { customers, orders } = useStore()
  const [sort, setSort] = useState('spent')
  const rows = useMemo(() => customers.map((c) => {
    const mine = orders.filter((o) => o.customer === c.id && o.status !== 'Cancelled')
    return { ...c, orders: mine.length, spent: mine.reduce((a, o) => a + o.total, 0), last: mine[0]?.date }
  }).sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b[sort] - a[sort])), [customers, orders, sort])

  const Th = ({ k, children, right }) => (
    <th className={`px-5 py-3 font-semibold ${right ? 'text-right' : 'text-left'}`}>
      <button onClick={() => setSort(k)} className={`inline-flex items-center gap-1 ${sort === k ? 'text-brand-600' : ''}`}>{children}<ArrowUpDown size={12} /></button>
    </th>
  )
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500"><tr><Th k="name">Customer</Th><th className="px-5 py-3 text-left font-semibold">City</th><Th k="orders">Orders</Th><th className="px-5 py-3 text-left font-semibold">Last order</th><Th k="spent" right>Total spent</Th></tr></thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold ${['bg-[#e6e0ff] text-[#4a2fd6]', 'bg-[#ffe7b3] text-[#7a4b00]', 'bg-[#d7ecf7] text-[#1d5b7a]', 'bg-[#fbdfe6] text-[#8a2846]'][i % 4]}`}>{c.name.split(' ').map((w) => w[0]).join('')}</span>
                  <div><b className="block">{c.name}</b><span className="text-xs text-slate-500">{c.email}</span></div>
                </div>
              </td>
              <td className="px-5 py-3.5">{c.city}</td>
              <td className="px-5 py-3.5">{c.orders}</td>
              <td className="px-5 py-3.5 text-slate-500">{c.last ? new Date(c.last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
              <td className="px-5 py-3.5 text-right font-bold">{money(c.spent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
