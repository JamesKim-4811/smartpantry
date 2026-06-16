import { useEffect, useState } from 'react'
import { createFoodItem, getFoodItems, deleteFoodItem, type FoodItem } from '../api'

export function NewFoodItemModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
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

export function DeleteFoodItemModal({ onClose }: { onClose: () => void }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getFoodItems().then(setFoodItems)
  }, [])

  async function handleDelete() {
    if (!selected) return
    if (!confirm('Delete this food item? This cannot be undone.')) return
    setDeleting(true); setError('')
    try {
      await deleteFoodItem(selected)
      setFoodItems(prev => prev.filter(f => f.food_item_id !== selected))
      // setSelected(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setDeleting(false)
  }

  const filtered = foodItems.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Delete Food Item</h2>
        <div className="form-row">
          <label>Search</label>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter food items…"
            autoFocus
          />
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty">No items found.</div>
          ) : (
            filtered.map(f => (
              <div
                key={f.food_item_id}
                onClick={() => setSelected(f.food_item_id)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: selected === f.food_item_id ? 'var(--surface2)' : 'transparent',
                  borderLeft: selected === f.food_item_id ? '3px solid var(--danger)' : '3px solid transparent',
                  fontSize: 13.5,
                }}
              >
                {f.name}
                {f.calories_per_unit != null && (
                  <span className="text-muted" style={{ fontSize: 12, marginLeft: 8 }}>
                    {f.calories_per_unit} kcal/unit
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={!selected || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Selected'}
          </button>
        </div>
      </div>
    </div>
  )
}
