import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Shopping from './pages/Shopping'
import MealLogs from './pages/MealLogs'
import Nutrition from './pages/Nutrition'
import Recipes from './pages/Recipes'
// 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="meals" element={<MealLogs />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="recipes" element={<Recipes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
