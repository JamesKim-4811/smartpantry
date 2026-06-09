import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/',             icon: '🏠', label: 'Dashboard'     },
  { to: '/inventory',    icon: '📦', label: 'Inventory'     },
  { to: '/shopping',     icon: '🛒', label: 'Shopping List' },
  { to: '/meals',        icon: '🍽️', label: 'Meal Logs'     },
  { to: '/nutrition',    icon: '📊', label: 'Nutrition'     },
  { to: '/recipes',      icon: '📖', label: 'Recipes'       },
]

export default function Layout() {
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
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
