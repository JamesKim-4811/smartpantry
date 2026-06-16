import { useEffect, useState } from 'react'
import { getHouseholds, getExpiring, getShoppingList, getNutrition, createFoodItem, type Household, type InventoryEntry, type ShoppingListItem, type NutritionSummary, type FoodItem } from '../api'

export default function Dashboard() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [expiring, setExpiring] = useState<InventoryEntry[]>([])
  const [shopping, setShopping] = useState<ShoppingListItem[]>([])
  const [nutrition, setNutrition] = useState<NutritionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showFoodModal, setShowFoodModal] = useState(false)

  useEffect(() => {
    getHouseholds().then(async (hh) => {
      if (!hh.length) { setLoading(false); return }
      const hid = hh[0].household_id
      setHousehold(hh[0])
      const [exp, shop, nut] = await Promise.all([
        getExpiring(hid, 7),
        getShoppingList(hid),
        getNutrition(hid),
      ])
      setExpiring(exp)
      setShopping(shop)
      setNutrition(nut)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading">Loading…</div>

  const unpurchased = shopping.filter(i => !i.is_purchased)
  const todayNut = nutrition.filter(n => n.log_date === new Date().toISOString().split('T')[0])
  const totalCalToday = todayNut.reduce((s, n) => s + n.total_calories, 0)

  function expiryBadge(days: number | null) {
    if (days === null) return null
    if (days <= 0) return <span className="badge badge-red">Expired</span>
    if (days <= 3) return <span className="badge badge-red">{days}d left</span>
    if (days <= 7) return <span className="badge badge-yellow">{days}d left</span>
    return <span className="badge badge-green">{days}d left</span>
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>{household?.name ?? 'Dashboard'}</h1>
          <p>Here's what's going on in your pantry today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowFoodModal(true)}>
          + New Food Item
        </button>
      </div>

      <div className="grid-3 mb-4">
        <div className="stat-card">
          <div className="stat-label">Expiring Soon (7 days)</div>
          <div className="stat-value" style={{ color: expiring.length ? 'var(--warning)' : 'var(--success)' }}>
            {expiring.length}
          </div>
          <div className="stat-sub">items</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Shopping List</div>
          <div className="stat-value">{unpurchased.length}</div>
          <div className="stat-sub">items to buy</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Calories Today</div>
          <div className="stat-value">{Math.round(totalCalToday)}</div>
          <div className="stat-sub">across household</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>⚠️ Expiring Items</h2>
          </div>
          {expiring.length === 0 ? (
            <div className="empty">Nothing expiring in the next 7 days 🎉</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {expiring.map(e => (
                    <tr key={e.entry_id}>
                      <td>{e.food_item}</td>
                      <td>{e.quantity} {e.unit_name}</td>
                      <td><span className="badge badge-gray">{e.storage_location}</span></td>
                      <td>{expiryBadge(e.days_until_expiry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>🛒 Shopping Needed</h2>
          </div>
          {unpurchased.length === 0 ? (
            <div className="empty">Nothing on the list!</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Added by</th></tr>
                </thead>
                <tbody>
                  {unpurchased.map(i => (
                    <tr key={i.item_id}>
                      <td>{i.food_item}</td>
                      <td>{i.quantity} {i.unit_name}</td>
                      <td className="text-muted">{i.added_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showFoodModal && (
        <NewFoodItemModal
          onClose={() => setShowFoodModal(false)}
          onSave={() => setShowFoodModal(false)}
        />
      )}
    </>
  )
}

function NewFoodItemModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<Partial<FoodItem>>({
    name: '',
    calories_per_unit: undefined,
    protein_per_unit: undefined,
    carbs_per_unit: undefined,
    fat_per_unit: undefined,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await createFoodItem(form)
      onSave()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setSaving(false)
  }

  function f(field: keyof FoodItem) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setForm(prev => ({
        ...prev,
        [field]: val === '' ? undefined : field === 'name' ? val : Number(val),
      }))
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Food Item</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Name</label>
            <input value={form.name ?? ''} onChange={f('name')} required placeholder="e.g. Chicken Thighs" />
          </div>
          <div className="form-row">
            <label>Calories per unit</label>
            <input type="number" step="0.001" value={form.calories_per_unit ?? ''} onChange={f('calories_per_unit')} placeholder="optional" />
          </div>
          <div className="form-row">
            <label>Protein per unit (g)</label>
            <input type="number" step="0.001" value={form.protein_per_unit ?? ''} onChange={f('protein_per_unit')} placeholder="optional" />
          </div>
          <div className="form-row">
            <label>Carbs per unit (g)</label>
            <input type="number" step="0.001" value={form.carbs_per_unit ?? ''} onChange={f('carbs_per_unit')} placeholder="optional" />
          </div>
          <div className="form-row">
            <label>Fat per unit (g)</label>
            <input type="number" step="0.001" value={form.fat_per_unit ?? ''} onChange={f('fat_per_unit')} placeholder="optional" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
