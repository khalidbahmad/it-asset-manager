import { useEffect, useState } from "react";
import { useStore } from "./store/StoreContext";
import Dashboard from "./pages/Dashboard";
import AssetsPage from "./pages/Assets";
import EmployeesPage from "./pages/Employees";
import MovementsPage from "./pages/Movements";
import AuditPage from "./pages/AuditLogs";
import AdminPage from "./pages/AdminPanel";
import LoginPage from "./pages/Login";
import { ToastContainer } from "react-toastify";


function AppInner(){
  const {state:{auth,assets},dispatch} = useStore();
  const [dark,setDark]=useState(true);
  const [page,setPage]=useState('dashboard');
  const [sidebarOpen,setSidebarOpen]=useState(false);
  useEffect(()=>{ document.body.classList.toggle('light-mode',!dark); },[dark]);
  const goTo = p=>{ setPage(p); setSidebarOpen(false); };

  const nav=[
    {key:'dashboard',icon:'📊',label:'Dashboard'},
    {key:'assets',icon:'💻',label:'Matériels',badge:assets.filter(a=>a.status==='maintenance').length,bt:'warn'},
    {key:'employees',icon:'👥',label:'Employés'},
    {key:'movements',icon:'🔄',label:'Mouvements'},
    {key:'audit',icon:'📜',label:'Audit Logs'},
    {key:'admin',icon:'⚙️',label:'Admin Panel'},
  ];
  const bNav=[
    {key:'dashboard',icon:'📊',label:'Home'},
    {key:'assets',icon:'💻',label:'Assets',badge:assets.filter(a=>a.status==='maintenance').length},
    {key:'employees',icon:'👥',label:'Employés'},
    {key:'movements',icon:'🔄',label:'Mouvements'},
    {key:'admin',icon:'⚙️',label:'Admin'},
  ];
  const names={dashboard:'Dashboard',assets:'Matériels',employees:'Employés',movements:'Mouvements',audit:'Audit Logs',admin:'Admin Panel'};

  if(!auth.loggedIn) return <LoginPage dark={dark} setDark={setDark}/>;

  return (
    <div className="app">
      {sidebarOpen&&<div className="sidebar-overlay visible" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`sidebar ${sidebarOpen?'open':''}`}>
        <div className="sidebar-logo">
          <div className="logo-badge">
            <div className="logo-icon">IT</div>
            <div className="logo-text">IT Inventory<div className="logo-sub">Management System</div></div>
          </div>
        </div>
        <div className="store-sidebar-info">
          <div className="store-sidebar-row">
            <span className="store-dot"/>
            <span style={{fontSize:10,color:'var(--accent2)',fontFamily:'Space Mono,monospace',fontWeight:700}}>STORE ACTIF</span>
            <span style={{fontSize:10,color:'var(--text3)',marginLeft:'auto'}}>{assets.length} assets</span>
          </div>
        </div>
        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {nav.map(n=>(
            <button key={n.key} className={`nav-item ${page===n.key?'active':''}`} onClick={()=>goTo(n.key)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
              {n.badge>0&&<span className={`nbadge ${n.bt||''}`}>{n.badge}</span>}
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{auth.role[0]}</div>
            <div className="user-info"><div className="user-name">{auth.role}</div><div className="user-role">Connecté · store</div></div>
          </div>
          <button className="nav-item" style={{marginTop:6}} onClick={()=>dispatch({type:'LOGOUT'})}>
            <span className="nav-icon">🚪</span>Déconnexion
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <button className={`hamburger ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(o=>!o)} aria-label="Menu"><span/><span/><span/></button>
          <div>
            <div className="topbar-title">{names[page]}</div>
            <div className="topbar-breadcrumb"><span>Store</span><span>›</span><span>{names[page]}</span></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
            <span className="role-label" style={{fontSize:11,color:'var(--text3)'}}>
              <span style={{color:'var(--accent2)',fontFamily:'Space Mono,monospace',fontSize:10}}>▸</span>
              {' '}<span style={{color:'var(--accent)'}}>{auth.role}</span>
            </span>
            <button className={`theme-toggle ${dark?'dark':''}`} onClick={()=>setDark(d=>!d)}>
              <div className="toggle-track"><div className="toggle-knob"/></div>
              <span className="toggle-text">{dark?'🌙':'☀️'}</span>
            </button>
          </div>
        </div>
        {page==='dashboard'&&<Dashboard/>}
        {page==='assets'&&<AssetsPage/>}
        {page==='employees'&&<EmployeesPage/>}
        {page==='movements'&&<MovementsPage/>}
        {page==='audit'&&<AuditPage/>}
        {page==='admin'&&<AdminPage/>}
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bNav.map(n=>(
            <button key={n.key} className={`bottom-nav-item ${page===n.key?'active':''}`} onClick={()=>goTo(n.key)}>
              {n.badge>0&&<span className="bottom-nav-badge">{n.badge}</span>}
              <span className="bottom-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <ToastContainer/>
    </div>
  );
}

export default AppInner;