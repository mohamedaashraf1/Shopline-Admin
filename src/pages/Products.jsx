import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import { useStore, money, ICONS } from '../data/store.jsx'

const CATS = ['Audio', 'Wearables', 'Apparel', 'Home', 'Bags', 'Accessories', 'Electronics']
const TONES = ['bg-violet-100 text-violet-600', 'bg-sky-100 text-sky-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600', 'bg-rose-100 text-rose-600']
const empty = { name: '', category: 'Audio', price: '', stock: '', sku: '', icon: 'Headphones', tone: TONES[0], active: true }

function Editor({ value, onClose, onSave }) {
  const [p, setP] = useState(value)
  const [err, setErr] = useState('')
  const set = (k, v) => { setP({ ...p, [k]: v }); setErr('') }
  const save = (e) => {
    e.preventDefault()
    if (p.name.trim().length < 3) return setErr('Product name must be at least 3 characters.')
    if (!(+p.price > 0)) return setErr('Price must be greater than 0.')
    if (!(+p.stock >= 0) || p.stock === '') return setErr('Stock must be 0 or more.')
    onSave({ ...p, name: p.name.trim(), price: +p.price, stock: +p.stock, sku: p.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000) })
  }
  const field = 'mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center"><h2 className="text-xl font-extrabold">{value.id ? 'Edit product' : 'New product'}</h2><button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div>
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm font-semibold">
          <label className="col-span-2">Name<input className={field} value={p.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Category<select className={field + ' bg-white'} value={p.category} onChange={(e) => set('category', e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>SKU<input className={field} value={p.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Auto" /></label>
          <label>Price ($)<input className={field} inputMode="decimal" value={p.price} onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))} /></label>
          <label>Stock<input className={field} inputMode="numeric" value={p.stock} onChange={(e) => set('stock', e.target.value.replace(/\D/g, ''))} /></label>
          <div className="col-span-2">Icon
            <div className="mt-1.5 flex flex-wrap gap-2">
              {Object.entries(ICONS).map(([k, Icon]) => <button type="button" key={k} onClick={() => set('icon', k)} className={`w-10 h-10 rounded-xl grid place-items-center border ${p.icon === k ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'}`} aria-label={k}><Icon size={18} /></button>)}
            </div>
          </div>
          <label className="col-span-2 flex items-center gap-2"><input type="checkbox" checked={p.active} onChange={(e) => set('active', e.target.checked)} className="accent-brand-600 w-4 h-4" />Visible in store</label>
        </div>
        {err && <p className="mt-4 text-sm text-rose-600">{err}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button><button className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700">Save product</button></div>
      </form>
    </div>
  )
}

export default function Products() {
  const { products, saveProduct, deleteProduct } = useStore()
  const [edit, setEdit] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const rows = products.filter((p) => (cat === 'All' || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" className="outline-none text-sm" /></label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 text-sm font-semibold"><option>All</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <button onClick={() => setEdit(empty)} className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-[0_2px_0_#3b25b8] hover:bg-brand-700"><Plus size={18} />Add product</button>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {rows.map((p) => {
          const Icon = ICONS[p.icon]
          const low = p.stock < 15
          return (
            <article key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 group">
              <div className={`relative h-36 rounded-xl grid place-items-center ${p.tone}`}>
                <Icon size={56} strokeWidth={1.5} />
                {!p.active && <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-500">Hidden</span>}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                  <button onClick={() => setEdit(p)} className="p-2 rounded-lg bg-white shadow-sm" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg bg-white shadow-sm text-rose-500" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-400">{p.category} · {p.sku}</p>
              <h3 className="font-bold leading-snug">{p.name}</h3>
              <div className="mt-3 flex items-center justify-between">
                <b className="text-lg">{money(p.price)}</b>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.stock === 0 ? 'bg-rose-50 text-rose-600' : low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}</span>
              </div>
            </article>
          )
        })}
      </div>
      {edit && <Editor value={edit} onClose={() => setEdit(null)} onSave={(p) => { saveProduct(p); setEdit(null) }} />}
    </div>
  )
}
