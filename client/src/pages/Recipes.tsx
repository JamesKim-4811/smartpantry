import { useEffect, useState } from 'react'
import {
  getHouseholds, getRecipes, getRecipeSuggestions, getRecipeIngredients,
  getFoodItems, getUnits, getHouseholdUsers, createRecipe, addRecipeIngredient,
  type Recipe, type RecipeIngredient, type FoodItem, type Unit, type User,
} from '../api'

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [suggestions, setSuggestions] = useState<Recipe[]>([])
  const [householdId, setHouseholdId] = useState<number | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState<'all' | 'suggestions'>('all')

  useEffect(() => {
    getHouseholds().then(async hh => {
      if (!hh.length) { setLoading(false); return }
      const hid = hh[0].household_id
      setHouseholdId(hid)
      const [rec, sug, fi, u, usr] = await Promise.all([
        getRecipes(), getRecipeSuggestions(hid), getFoodItems(), getUnits(), getHouseholdUsers(hid),
      ])
      setRecipes(rec); setSuggestions(sug); setFoodItems(fi); setUnits(u); setUsers(usr)
      setLoading(false)
    })
  }, [])

  async function selectRecipe(recipe: Recipe) {
    if (selected?.recipe_id === recipe.recipe_id) { setSelected(null); return }
    setSelected(recipe)
    const data = await getRecipeIngredients(recipe.recipe_id)
    setIngredients(data)
  }

  const displayed = tab === 'all' ? recipes : suggestions

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1>Recipes</h1>
        <p>{suggestions.length} recipe{suggestions.length !== 1 ? 's' : ''} cookable from your current inventory.</p>
      </div>

      <div className="flex gap-2 mb-4 items-center justify-between">
        <div className="flex gap-2">
          <button className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('all')}>
            All ({recipes.length})
          </button>
          <button className={`btn btn-sm ${tab === 'suggestions' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('suggestions')}>
            ✅ Cookable ({suggestions.length})
          </button>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Recipe</button>
      </div>

      <div className="grid-2">
        <div className="card" style={{ maxHeight: 540, overflowY: 'auto' }}>
          {displayed.length === 0 ? (
            <div className="empty">{tab === 'suggestions' ? 'No cookable recipes with current stock.' : 'No recipes yet.'}</div>
          ) : (
            displayed.map(recipe => {
              const isCookable = suggestions.some(s => s.recipe_id === recipe.recipe_id)
              return (
                <div
                  key={recipe.recipe_id}
                  onClick={() => selectRecipe(recipe)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selected?.recipe_id === recipe.recipe_id ? 'var(--surface2)' : 'transparent',
                    marginBottom: 4,
                    borderLeft: selected?.recipe_id === recipe.recipe_id ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{recipe.name}</div>
                    {isCookable && <span className="badge badge-green">✓ Cookable</span>}
                  </div>
                  {recipe.description && <div className="text-muted" style={{ fontSize: 12, marginTop: 3 }}>{recipe.description}</div>}
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>by {recipe.created_by}</div>
                </div>
              )
            })
          )}
        </div>

        <div className="card">
          {!selected ? (
            <div className="empty" style={{ paddingTop: 60 }}>Select a recipe to see ingredients.</div>
          ) : (
            <>
              <div className="card-header">
                <div>
                  <h2>{selected.name}</h2>
                  {selected.description && <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{selected.description}</p>}
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Ingredient</th><th>Quantity</th></tr></thead>
                  <tbody>
                    {ingredients.length === 0 && <tr><td colSpan={2} className="empty">No ingredients added.</td></tr>}
                    {ingredients.map(ing => (
                      <tr key={ing.recipe_ingredient_id}>
                        <td>{ing.food_item}</td>
                        <td>{ing.quantity} {ing.unit_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <NewRecipeModal
          foodItems={foodItems}
          units={units}
          users={users}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            setShowModal(false)
            const [rec, sug] = await Promise.all([getRecipes(), getRecipeSuggestions(householdId!)])
            setRecipes(rec); setSuggestions(sug)
          }}
        />
      )}
    </>
  )
}

function NewRecipeModal({ foodItems, units, users, onClose, onSave }: {
  foodItems: FoodItem[]; units: Unit[]; users: User[]
  onClose: () => void; onSave: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createdBy, setCreatedBy] = useState(users[0]?.user_id ?? '')
  const [ingredients, setIngredients] = useState([{ food_item_id: foodItems[0]?.food_item_id ?? '', unit_id: units[0]?.unit_id ?? '', quantity: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addIngredient() {
    setIngredients(prev => [...prev, { food_item_id: foodItems[0]?.food_item_id ?? '', unit_id: units[0]?.unit_id ?? '', quantity: '' }])
  }

  function removeIngredient(i: number) {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateIngredient(i: number, field: string, value: string) {
    setIngredients(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await createRecipe({ name, description: description || null, created_by_user_id: Number(createdBy) })
      const recipeId = (res as any).recipe_id
      await Promise.all(ingredients.map(ing =>
        addRecipeIngredient(recipeId, { food_item_id: Number(ing.food_item_id), unit_id: Number(ing.unit_id), quantity: Number(ing.quantity) })
      ))
      onSave()
    } catch (err: any) { setError(err.message) }
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Recipe</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Description (optional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Created by</label>
            <select value={createdBy} onChange={e => setCreatedBy(e.target.value)}>
              {users.map(u => <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Ingredients</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addIngredient}>+ Add</button>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center mb-4">
                <select value={ing.food_item_id} onChange={e => updateIngredient(i, 'food_item_id', e.target.value)} required style={{ flex: 2 }}>
                  {foodItems.map(fi => <option key={fi.food_item_id} value={fi.food_item_id}>{fi.name}</option>)}
                </select>
                <input type="number" step="0.01" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} placeholder="qty" required style={{ flex: 1 }} />
                <select value={ing.unit_id} onChange={e => updateIngredient(i, 'unit_id', e.target.value)} required style={{ flex: 1 }}>
                  {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                </select>
                {ingredients.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeIngredient(i)}>×</button>
                )}
              </div>
            ))}
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
