import { useEffect, useState } from 'react'
import {
  getHouseholds, getHouseholdUsers, getFoodItems, getUnits,
  getUserMealLogs, createMealLog, addMealLogEntry, deleteMealLog,
  type User, type FoodItem, type Unit, type MealLogEntry,
} from '../api'

export default function MealLogs() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<MealLogEntry[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function loadLogs(user: User) {
    setSelectedUser(user)
    const data = await getUserMealLogs(user.user_id)
    setLogs(data)
  }

  useEffect(() => {
    getHouseholds().then(async hh => {
      if (!hh.length) { setLoading(false); return }
      const hid = hh[0].household_id
      const [usr, fi, u] = await Promise.all([
        getHouseholdUsers(hid), getFoodItems(), getUnits(),
      ])
      setUsers(usr); setFoodItems(fi); setUnits(u)
      if (usr.length) await loadLogs(usr[0])
      setLoading(false)
    })
  }, [])

  async function handleDelete(logId: number) {
    if (!confirm('Delete this meal log?')) return
    await deleteMealLog(logId)
    setLogs(prev => prev.filter(l => l.meal_log_id !== logId))
  }

  // Group entries by log
  const grouped = logs.reduce<Record<number, { logged_at: string; notes: string | null; entries: MealLogEntry[] }>>(
    (acc, entry) => {
      if (!acc[entry.meal_log_id]) {
        acc[entry.meal_log_id] = { logged_at: entry.logged_at, notes: entry.notes, entries: [] }
      }
      acc[entry.meal_log_id].entries.push(entry)
      return acc
    },
    {}
  )

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1>Meal Logs</h1>
        <p>Track what each household member is eating.</p>
      </div>

      <div className="flex gap-2 mb-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="text-muted" style={{ fontSize: 13 }}>Viewing:</span>
          <div className="flex gap-2">
            {users.map(u => (
              <button
                key={u.user_id}
                className={`btn btn-sm ${selectedUser?.user_id === u.user_id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => loadLogs(u)}
              >
                {u.first_name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Meal</button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card"><div className="empty">No meal logs yet.</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(grouped).reverse().map(([logId, log]) => {
            const totalCal = log.entries.reduce((s, e) => s + e.calories_consumed, 0)
            return (
              <div key={logId} className="card">
                <div className="card-header">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(log.logged_at).toLocaleString()}</div>
                    {log.notes && <div className="text-muted" style={{ fontSize: 12 }}>{log.notes}</div>}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="badge badge-blue">{Math.round(totalCal)} kcal</span>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(Number(logId))}>Delete</button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Food</th><th>Quantity</th><th>Calories</th></tr>
                    </thead>
                    <tbody>
                      {log.entries.map((entry, i) => (
                        <tr key={i}>
                          <td>{entry.food_item}</td>
                          <td>{entry.quantity} {entry.unit_name}</td>
                          <td>{entry.calories_consumed} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && selectedUser && (
        <LogMealModal
          user={selectedUser}
          foodItems={foodItems}
          units={units}
          onClose={() => setShowModal(false)}
          onSave={async () => { setShowModal(false); await loadLogs(selectedUser) }}
        />
      )}
    </>
  )
}

function LogMealModal({ user, foodItems, units, onClose, onSave }: {
  user: User; foodItems: FoodItem[]; units: Unit[]
  onClose: () => void; onSave: () => void
}) {
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState([{ food_item_id: foodItems[0]?.food_item_id ?? '', unit_id: units[0]?.unit_id ?? '', quantity: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addEntry() {
    setEntries(prev => [...prev, { food_item_id: foodItems[0]?.food_item_id ?? '', unit_id: units[0]?.unit_id ?? '', quantity: '' }])
  }

  function removeEntry(i: number) {
    setEntries(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateEntry(i: number, field: string, value: string) {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const log = await createMealLog({ user_id: user.user_id, notes: notes || null })
      const logId = (log as any).meal_log_id
      await Promise.all(entries.map(en =>
        addMealLogEntry(logId, { food_item_id: Number(en.food_item_id), unit_id: Number(en.unit_id), quantity: Number(en.quantity) })
      ))
      onSave()
    } catch (err: any) { setError(err.message) }
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Log Meal for {user.first_name}</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Breakfast" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="flex items-center justify-between mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Food Items</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addEntry}>+ Add</button>
            </div>
            {entries.map((entry, i) => (
              <div key={i} className="flex gap-2 items-center mb-4">
                <select value={entry.food_item_id} onChange={e => updateEntry(i, 'food_item_id', e.target.value)} required style={{ flex: 2 }}>
                  {foodItems.map(fi => <option key={fi.food_item_id} value={fi.food_item_id}>{fi.name}</option>)}
                </select>
                <input type="number" step="0.01" value={entry.quantity} onChange={e => updateEntry(i, 'quantity', e.target.value)} placeholder="qty" required style={{ flex: 1 }} />
                <select value={entry.unit_id} onChange={e => updateEntry(i, 'unit_id', e.target.value)} required style={{ flex: 1 }}>
                  {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                </select>
                {entries.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeEntry(i)}>×</button>
                )}
              </div>
            ))}
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Log Meal'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
