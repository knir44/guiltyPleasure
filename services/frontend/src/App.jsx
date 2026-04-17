import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard  from './pages/Dashboard.jsx';
import Library    from './pages/Library.jsx';
import AddItem    from './pages/AddItem.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Insights   from './pages/Insights.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <nav className={styles.nav}>
          <span className={styles.logo}>guiltyPleasure 🎬</span>
          <div className={styles.links}>
            <NavLink to="/"         end className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
            <NavLink to="/library"      className={({ isActive }) => isActive ? styles.active : ''}>Library</NavLink>
            <NavLink to="/add"          className={({ isActive }) => isActive ? styles.active : ''}>+ Add</NavLink>
            <NavLink to="/insights"     className={({ isActive }) => isActive ? styles.active : ''}>Insights</NavLink>
          </div>
        </nav>
        <main className={styles.main}>
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/library"   element={<Library />} />
            <Route path="/add"       element={<AddItem />} />
            <Route path="/item/:id"  element={<ItemDetail />} />
            <Route path="/insights"  element={<Insights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
