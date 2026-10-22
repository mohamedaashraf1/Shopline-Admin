import { createContext, useContext, useEffect, useState } from 'react'
import { Headphones, Watch, Shirt, Coffee, Backpack, Laptop, Smartphone, Footprints, Glasses, Lamp, Camera, Speaker } from 'lucide-react'

// Deterministic PRNG so the demo data looks the same on every load
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

export const ICONS = { Headphones, Watch, Shirt, Coffee, Backpack, Laptop, Smartphone, Footprints, Glasses, Lamp, Camera, Speaker }

const baseProducts = [
  ['Aura Wireless Headphones', 'Audio', 'Headphones', 129, 'bg-violet-100 text-violet-600'],
  ['Pulse Smart Watch', 'Wearables', 'Watch', 199, 'bg-sky-100 text-sky-600'],
  ['Everyday Cotton Tee', 'Apparel', 'Shirt', 24, 'bg-amber-100 text-amber-600'],
  ['Brew Pro Coffee Maker', 'Home', 'Coffee', 89, 'bg-orange-100 text-orange-600'],
  ['Trail 22L Backpack', 'Bags', 'Backpack', 64, 'bg-emerald-100 text-emerald-600'],
  ['Nova 14" Laptop Sleeve', 'Accessories', 'Laptop', 35, 'bg-slate-200 text-slate-600'],
  ['Flex Phone Case', 'Accessories', 'Smartphone', 19, 'bg-pink-100 text-pink-600'],
  ['Stride Running Shoes', 'Apparel', 'Footprints', 112, 'bg-lime-100 text-lime-700'],
  ['Clarity Blue-Light Glasses', 'Wearables', 'Glasses', 45, 'bg-cyan-100 text-cyan-700'],
  ['Halo Desk Lamp', 'Home', 'Lamp', 58, 'bg-yellow-100 text-yellow-700'],
  ['Snap Mini Camera', 'Electronics', 'Camera', 249, 'bg-rose-100 text-rose-600'],
  ['Boom Portable Speaker', 'Audio', 'Speaker', 79, 'bg-indigo-100 text-indigo-600'],
]
const first = ['Lina', 'Omar', 'Sara', 'Youssef', 'Mona', 'Karim', 'Nour', 'Hassan', 'Dina', 'Adam', 'Laila', 'Ziad', 'Hana', 'Tarek', 'Salma', 'Ali', 'Rana', 'Fady', 'Maya', 'Khaled']
const last = ['Hassan', 'Adel', 'Mostafa', 'Fathy', 'Ibrahim', 'Saleh', 'Nabil', 'Samir', 'Fouad', 'Kamal']
const cities = ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta', 'Zagazig', 'Ismailia', 'Banha']

function seed() {
  const r = rng(42)
  const products = baseProducts.map(([name, category, icon, price, tone], i) => ({
    id: 'P' + (101 + i), name, category, icon, price, tone,
    stock: Math.floor(r() * 140), sku: 'SKU-' + (4800 + i * 37), active: r() > 0.1,
  }))
  const customers = first.map((f, i) => ({
    id: 'C' + (2001 + i), name: `${f} ${last[i % last.length]}`, email: `${f.toLowerCase()}.${last[i % last.length].toLowerCase()}@mail.example`,
    city: cities[i % cities.length], joined: new Date(Date.now() - (i * 9 + 3) * 864e5).toISOString(),
  }))
  const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled']
  const orders = Array.from({ length: 64 }, (_, i) => {
    const items = 1 + Math.floor(r() * 3)
    const lines = Array.from({ length: items }, () => { const p = products[Math.floor(r() * products.length)]; return { pid: p.id, qty: 1 + Math.floor(r() * 2), price: p.price } })
    const daysAgo = Math.floor((i / 64) * 30)
    return {
      id: '#' + (10480 - i), customer: customers[Math.floor(r() * customers.length)].id, lines,
      total: lines.reduce((a, l) => a + l.qty * l.price, 0),
      status: i < 4 ? ['Pending', 'Processing', 'Pending', 'Shipped'][i] : statuses[Math.floor(r() * statuses.length)],
      date: new Date(Date.now() - daysAgo * 864e5 - Math.floor(r() * 864e5 * 0.8)).toISOString(),
      payment: r() > 0.4 ? 'Card' : 'Cash on delivery',
    }
  })
  return { products, customers, orders }
}

const KEY = 'shopline_admin_v1'
const Ctx = createContext(null)
export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (v?.orders?.length) return v } catch {}
    return seed()
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {} }, [db])
  const api = {
    ...db,
    setOrderStatus: (id, status) => setDb((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
    saveProduct: (p) => setDb((d) => ({ ...d, products: d.products.some((x) => x.id === p.id) ? d.products.map((x) => (x.id === p.id ? p : x)) : [{ ...p, id: 'P' + (101 + d.products.length + Math.floor(Math.random() * 900)) }, ...d.products] })),
    deleteProduct: (id) => setDb((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) })),
    reset: () => setDb(seed()),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)
export const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
export const STATUS_TONE = {
  Delivered: 'bg-emerald-50 text-emerald-700', Shipped: 'bg-sky-50 text-sky-700', Processing: 'bg-violet-50 text-violet-700',
  Pending: 'bg-amber-50 text-amber-700', Cancelled: 'bg-rose-50 text-rose-600',
}
