import { useEffect, useState } from 'react'
import {
  getHouseholds, getInventory, getFoodItems, getUnits, getHouseholdUsers,
  createInventoryEntry, updateInventoryEntry, deleteInventoryEntry,
  type InventoryEntry, type FoodItem, type Unit, type User,
} from '../api'

const LOCATIONS = ['fridge', 'pantry', 'freezer']

export default function Inventory() {
  const [entries, setEntries] = useState<InventoryEntry[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [householdId, setHouseholdId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<InventoryEntry | null>(null)
  const [filter, setFilter] = useState('')

  async function load(hid: number) {
    const data = await getInventory(hid)
    setEntries(data)
  }

  useEffect(() => {
    getHouseholds().then(async hh => {
      if (!hh.length) { setLoading(false); return }
      const hid = hh[0].household_id
      setHouseholdId(hid)
      const [inv, fi, u, usr] = await Promise.all([
        getInventory(hid), getFoodItems(), getUnits(), getHouseholdUsers(hid),
      ])
      setEntries(inv); setFoodItems(fi); setUnits(u); setUsers(usr)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Remove this entry?')) return
    await deleteInventoryEntry(id)
    setEntries(e => e.filter(x => x.entry_id !== id))
  }

  function expiryClass(days: number | null) {
    if (days === null) return ''
    if (days <= 0) return 'text-danger'
    if (days <= 3) return 'text-danger'
    if (days <= 7) return 'text-warning'
    return 'text-success'
  }

  const filtered = entries.filter(e =>
    e.food_item.toLowerCase().includes(filter.toLowerCase()) ||
    e.storage_location.includes(filter.toLowerCase())
  )

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Everything currently in your household.</p>
      </div>

      <div className="flex gap-2 mb-4 items-center justify-between">
        <input
          placeholder="Filter by item or location…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          + Add Item
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Food Item</th><th>Quantity</th><th>Location</th>
                <th>Purchased</th><th>Expires</th><th>Added by</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty">No entries found.</td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.entry_id}>
                  <td><strong>{e.food_item}</strong></td>
                  <td>{e.quantity} {e.unit_name}</td>
                  <td><span className="badge badge-gray">{e.storage_location}</span></td>
                  <td className="text-muted">{e.purchase_date}</td>
                  <td className={expiryClass(e.days_until_expiry)}>
                    {e.expiration_date
                      ? `${e.expiration_date}${e.days_until_expiry !== null ? ` (${e.days_until_expiry}d)` : ''}`
                      : '—'}
                  </td>
                  <td className="text-muted">{e.added_by}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(e); setShowModal(true) }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.entry_id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <InventoryModal
          editing={editing}
          foodItems={foodItems}
          units={units}
          users={users}
          householdId={householdId!}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            setShowModal(false)
            await load(householdId!)
          }}
        />
      )}
    </>
  )
}

function InventoryModal({ editing, foodItems, units, users, householdId, onClose, onSave }: {
  editing: InventoryEntry | null
  foodItems: FoodItem[]
  units: Unit[]
  users: User[]
  householdId: number
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    food_item_id: editing?.food_item_id ?? foodItems[0]?.food_item_id ?? '',
    unit_id: editing?.unit_id ?? units[0]?.unit_id ?? '',
    added_by_user_id: editing?.added_by_user_id ?? users[0]?.user_id ?? '',
    quantity: editing?.quantity ?? '',
    purchase_date: editing?.purchase_date ?? new Date().toISOString().split('T')[0],
    expiration_date: editing?.expiration_date ?? '',
    storage_location: editing?.storage_location ?? 'fridge',
    household_id: householdId,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) {
        await updateInventoryEntry(editing.entry_id, {
          quantity: Number(form.quantity),
          expiration_date: form.expiration_date || null,
          storage_location: form.storage_location,
        })
      } else {
        await createInventoryEntry({ ...form, quantity: Number(form.quantity) })
      }
      onSave()
    } catch (err: any) { setError(err.message) }
    setSaving(false)
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{editing ? 'Edit Entry' : 'Add Inventory Entry'}</h2>
        <form onSubmit={submit}>
          {!editing && (
            <>
              <div className="form-row">
                <label>Food Item</label>
                <select value={form.food_item_id} onChange={f('food_item_id')} required>
                  {foodItems.map(fi => <option key={fi.food_item_id} value={fi.food_item_id}>{fi.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Unit</label>
                <select value={form.unit_id} onChange={f('unit_id')} required>
                  {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Added by</label>
                <select value={form.added_by_user_id} onChange={f('added_by_user_id')} required>
                  {users.map(u => <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="form-row">
            <label>Quantity</label>
            <input type="number" step="0.01" value={form.quantity} onChange={f('quantity')} required />
          </div>
          <div className="form-row">
            <label>Storage Location</label>
            <select value={form.storage_location} onChange={f('storage_location')}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {!editing && (
            <div className="form-row">
              <label>Purchase Date</label>
              <input type="date" value={form.purchase_date} onChange={f('purchase_date')} required />
            </div>
          )}
          <div className="form-row">
            <label>Expiration Date (optional)</label>
            <input type="date" value={form.expiration_date} onChange={f('expiration_date')} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
