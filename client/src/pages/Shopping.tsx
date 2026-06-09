import { useEffect, useState } from 'react'
import {
  getHouseholds, getShoppingList, getFoodItems, getUnits, getHouseholdUsers,
  addShoppingItem, markPurchased, deleteShoppingItem,
  type ShoppingListItem, type FoodItem, type Unit, type User,
} from '../api'

export default function Shopping() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [listId, setListId] = useState<number | null>(null)
  const [householdId, setHouseholdId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function load(hid: number) {
    const data = await getShoppingList(hid)
    setItems(data)
    if (data.length) setListId(data[0].list_id)
  }

  useEffect(() => {
    getHouseholds().then(async hh => {
      if (!hh.length) { setLoading(false); return }
      const hid = hh[0].household_id
      setHouseholdId(hid)
      const [shop, fi, u, usr] = await Promise.all([
        getShoppingList(hid), getFoodItems(), getUnits(), getHouseholdUsers(hid),
      ])
      setItems(shop)
      if (shop.length) setListId(shop[0].list_id)
      setFoodItems(fi); setUnits(u); setUsers(usr)
      setLoading(false)
    })
  }, [])

  async function togglePurchased(item: ShoppingListItem) {
    await markPurchased(item.item_id, !item.is_purchased)
    setItems(prev => prev.map(i => i.item_id === item.item_id ? { ...i, is_purchased: !i.is_purchased } : i))
  }

  async function handleDelete(id: number) {
    await deleteShoppingItem(id)
    setItems(prev => prev.filter(i => i.item_id !== id))
  }

  const unpurchased = items.filter(i => !i.is_purchased)
  const purchased = items.filter(i => i.is_purchased)

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1>Shopping List</h1>
        <p>{unpurchased.length} item{unpurchased.length !== 1 ? 's' : ''} to buy · {purchased.length} purchased</p>
      </div>

      <div className="flex gap-2 mb-4 justify-between items-center">
        <span />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Item</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th></th><th>Item</th><th>Quantity</th><th>Added by</th><th></th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="empty">Your list is empty.</td></tr>
              )}
              {unpurchased.map(item => (
                <tr key={item.item_id}>
                  <td style={{ width: 36 }}>
                    <input type="checkbox" checked={false} onChange={() => togglePurchased(item)} />
                  </td>
                  <td><strong>{item.food_item}</strong></td>
                  <td>{item.quantity} {item.unit_name}</td>
                  <td className="text-muted">{item.added_by}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.item_id)}>Remove</button>
                  </td>
                </tr>
              ))}
              {purchased.length > 0 && (
                <tr><td colSpan={5} style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Purchased</td></tr>
              )}
              {purchased.map(item => (
                <tr key={item.item_id} style={{ opacity: 0.5 }}>
                  <td style={{ width: 36 }}>
                    <input type="checkbox" checked onChange={() => togglePurchased(item)} />
                  </td>
                  <td><span className="strike">{item.food_item}</span></td>
                  <td className="strike">{item.quantity} {item.unit_name}</td>
                  <td className="text-muted">{item.added_by}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.item_id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && listId && (
        <AddItemModal
          listId={listId}
          foodItems={foodItems}
          units={units}
          users={users}
          onClose={() => setShowModal(false)}
          onSave={async () => { setShowModal(false); await load(householdId!) }}
        />
      )}
    </>
  )
}

function AddItemModal({ listId, foodItems, units, users, onClose, onSave }: {
  listId: number; foodItems: FoodItem[]; units: Unit[]; users: User[]
  onClose: () => void; onSave: () => void
}) {
  const [form, setForm] = useState({
    list_id: listId,
    food_item_id: foodItems[0]?.food_item_id ?? '',
    unit_id: units[0]?.unit_id ?? '',
    added_by_user_id: users[0]?.user_id ?? '',
    quantity: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await addShoppingItem({ ...form, quantity: Number(form.quantity) })
      onSave()
    } catch (err: any) { setError(err.message) }
    setSaving(false)
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add to Shopping List</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Food Item</label>
            <select value={form.food_item_id} onChange={f('food_item_id')} required>
              {foodItems.map(fi => <option key={fi.food_item_id} value={fi.food_item_id}>{fi.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input type="number" step="0.01" value={form.quantity} onChange={f('quantity')} required />
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
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
