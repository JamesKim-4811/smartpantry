import { useEffect, useState } from 'react'
import { getHouseholds, getNutrition, type NutritionSummary } from '../api'

export default function Nutrition() {
  const [data, setData] = useState<NutritionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    getHouseholds().then(async hh => {
      if (!hh.length) { setLoading(false); return }
      const rows = await getNutrition(hh[0].household_id)
      setData(rows)
      setLoading(false)
    })
  }, [])

  const dates = [...new Set(data.map(d => d.log_date))].sort((a, b) => b.localeCompare(a))
  const filtered = filterDate ? data.filter(d => d.log_date === filterDate) : data

  // Group by date for section headers
  const byDate = filtered.reduce<Record<string, NutritionSummary[]>>((acc, row) => {
    if (!acc[row.log_date]) acc[row.log_date] = []
    acc[row.log_date].push(row)
    return acc
  }, {})

  function macroBar(value: number, max: number, color: string) {
    const pct = Math.min((value / max) * 100, 100)
    return (
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 6, width: 80 }}>
        <div style={{ background: color, borderRadius: 4, height: 6, width: `${pct}%`, transition: 'width 0.3s' }} />
      </div>
    )
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1>Nutrition</h1>
        <p>Calorie and macro summary by household member per day.</p>
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Filter by date:</label>
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 160 }}>
          <option value="">All dates</option>
          {dates.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {Object.keys(byDate).length === 0 ? (
        <div className="card"><div className="empty">No nutrition data yet. Log some meals first.</div></div>
      ) : (
        Object.entries(byDate).map(([date, rows]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{date}</div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Calories</th>
                      <th>Protein (g)</th>
                      <th>Carbs (g)</th>
                      <th>Fat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.user_id}>
                        <td><strong>{row.member}</strong></td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <span>{Math.round(row.total_calories)}</span>
                            {macroBar(row.total_calories, 2500, 'var(--accent)')}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <span>{Math.round(row.total_protein)}</span>
                            {macroBar(row.total_protein, 150, '#4ecb71')}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <span>{Math.round(row.total_carbs)}</span>
                            {macroBar(row.total_carbs, 300, 'var(--warning)')}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <span>{Math.round(row.total_fat)}</span>
                            {macroBar(row.total_fat, 80, 'var(--danger)')}
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 600 }}>
                      <td>Total</td>
                      <td>{Math.round(rows.reduce((s, r) => s + r.total_calories, 0))}</td>
                      <td>{Math.round(rows.reduce((s, r) => s + r.total_protein, 0))}</td>
                      <td>{Math.round(rows.reduce((s, r) => s + r.total_carbs, 0))}</td>
                      <td>{Math.round(rows.reduce((s, r) => s + r.total_fat, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}
