import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { useStore, money, STATUS_TONE, ICONS } from '../data/store.jsx'

const day = (iso) => iso.slice(0, 10)

export default function Overview() {
  const { orders, products, customers } = useStore()
  const [range, setRange] = useState(30)

  const data = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'Cancelled')
    const days = [...Array(range)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (range - 1 - i)); return d.toISOString().slice(0, 10) })
    const series = days.map((d) => ({ d: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: valid.filter((o) => day(o.date) === d).reduce((a, o) => a + o.total, 0) }))
    const cutoff = days[0]
    const inRange = valid.filter((o) => day(o.date) >= cutoff)
    const revenue = inRange.reduce((a, o) => a + o.total, 0)
    const count = inRange.length
    const byCat = {}
    inRange.forEach((o) => o.lines.forEach((l) => { const p = products.find((x) => x.id === l.pid); if (p) byCat[p.category] = (byCat[p.category] || 0) + l.qty * l.price }))
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))
    const sold = {}
    inRange.forEach((o) => o.lines.forEach((l) => { sold[l.pid] = (sold[l.pid] || 0) + l.qty }))
    const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pid, qty]) => ({ p: products.find((x) => x.id === pid), qty })).filter((x) => x.p)
    const prevStart = new Date(cutoff); prevStart.setDate(prevStart.getDate() - range)
    const prev = valid.filter((o) => day(o.date) >= prevStart.toISOString().slice(0, 10) && day(o.date) < cutoff)
    const prevRevenue = prev.reduce((a, o) => a + o.total, 0)
    const pct = (a, b) => (b ? ((a - b) / b) * 100 : 0)
    const aov = count ? revenue / count : 0
    const prevAov = prev.length ? prevRevenue / prev.length : 0
    return { series, revenue, count, aov, cats, top, d: { revenue: pct(revenue, prevRevenue), count: pct(count, prev.length), aov: pct(aov, prevAov) }, hasPrev: prev.length > 0 }
  }, [orders, products, range])

  const kpis = [
    ['Revenue', money(data.revenue), DollarSign, data.d.revenue, 'bg-brand-600 text-white'],
    ['Orders', data.count, ShoppingBag, data.d.count, 'bg-white'],
    ['Avg. order value', money(data.aov), TrendingUp, data.d.aov, 'bg-white'],
    ['Customers', customers.length, Users, null, 'bg-white'],
  ]
  const COLORS = ['#5b3df5', '#a78bfa', '#f472b6', '#38bdf8', '#fbbf24']

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(([label, value, Icon, delta, cls], i) => { const up = delta === null || delta >= 0; return (
          <div key={label} className={`rounded-2xl p-5 border border-slate-100 ${i === 0 ? 'border-transparent' : ''} ${cls}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${i === 0 ? 'text-white/80' : 'text-slate-500'}`}>{label}</span>
              <span className={`w-9 h-9 rounded-xl grid place-items-center ${i === 0 ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}><Icon size={18} /></span>
            </div>
            <b className="block mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</b>
            {delta === null || !data.hasPrev
              ? <span className={`mt-1 block text-xs font-semibold ${i === 0 ? 'text-white/80' : 'text-slate-400'}`}>{delta === null ? 'All registered customers' : `Last ${range} days`}</span>
              : <span className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${i === 0 ? 'text-white/90' : up ? 'text-emerald-600' : 'text-rose-500'}`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(delta).toFixed(1)}% vs previous {range} days</span>}
          </div>
        )})}
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold">Revenue</h2><p className="text-sm text-slate-500">Daily revenue, excluding cancelled orders</p></div>
            <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold">
              {[7, 14, 30].map((r) => <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg ${range === r ? 'bg-white shadow-sm' : 'text-slate-500'}`}>{r}D</button>)}
            </div>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <AreaChart data={data.series} margin={{ left: -10, right: 5, top: 5 }}>
                <defs><linearGradient id="rev" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5b3df5" stopOpacity={0.35} /><stop offset="100%" stopColor="#5b3df5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#eef0f6" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => '$' + v} />
                <Tooltip formatter={(v) => [money(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#5b3df5" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="font-bold">Sales by category</h2>
          <div className="h-48 mt-2">
            <ResponsiveContainer>
              <PieChart><Pie data={data.cats} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">{data.cats.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip formatter={(v) => money(v)} /></PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.cats.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} /><span className="flex-1">{c.name}</span><b>{money(c.value)}</b></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-100">
          <div className="p-5 flex justify-between items-center"><h2 className="font-bold">Recent orders</h2><Link to="/orders" className="text-sm font-bold text-brand-600">View all</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-bold">{o.id}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{o.lines.length} item{o.lines.length > 1 ? 's' : ''}</td>
                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_TONE[o.status]}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-right font-bold">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="font-bold">Top products</h2>
          <ul className="mt-4 space-y-3">
            {data.top.map(({ p, qty }) => {
              const Icon = ICONS[p.icon]
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <span className={`w-11 h-11 rounded-xl grid place-items-center ${p.tone}`}><Icon size={20} /></span>
                  <div className="flex-1 min-w-0"><b className="block text-sm truncate">{p.name}</b><span className="text-xs text-slate-500">{qty} sold</span></div>
                  <b className="text-sm">{money(p.price)}</b>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
