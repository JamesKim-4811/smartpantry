import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import {NewFoodItemModal} from '../components/NewFoodItemModal'

const links = [
  { to: '/',             icon: '🏠', label: 'Dashboard'     },
  { to: '/inventory',    icon: '📦', label: 'Inventory'     },
  { to: '/shopping',     icon: '🛒', label: 'Shopping List' },
  { to: '/meals',        icon: '🍽️', label: 'Meal Logs'     },
  { to: '/nutrition',    icon: '📊', label: 'Nutrition'     },
  { to: '/recipes',      icon: '📖', label: 'Recipes'       },
]

export default function Layout() {
  const [showFoodModal, setShowFoodModal] = useState(false)

  
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🥬 SmartPantry</div>
        <nav>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
          <button className="btn btn-primary" onClick={() => setShowFoodModal(true)}>+ New Food Item</button>
          {showFoodModal && (
            <NewFoodItemModal
              onClose={() => setShowFoodModal(false)}
              onSave={() => setShowFoodModal(false)}
            />
          )}
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
