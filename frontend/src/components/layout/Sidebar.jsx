import { useStore } from '../../store/StoreContext';

export default function Sidebar({ open, navItems, currentPath, role, onNavigate, onLogout }) {
  const { state } = useStore();

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon">IT</div>
          <div className="logo-text">
            IT Inventory
            <div className="logo-sub">Management System</div>
          </div>
        </div>
      </div>

      {/* Indicateur store actif */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'rgba(56,217,169,.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0, animation: 'pulse 2s infinite', display: 'inline-block' }}/>
          <span style={{ fontSize: 10, color: 'var(--accent2)', fontFamily: 'monospace', fontWeight: 700 }}>STORE ACTIF</span>
          <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{state.assets.length} assets</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-section">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span className="nbadge warn">{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Footer utilisateur */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{role?.[0]}</div>
          <div className="user-info">
            <div className="user-name">{role}</div>
            <div className="user-role">Connecté</div>
          </div>
        </div>
        <button className="nav-item" style={{ marginTop: 8 }} onClick={onLogout}>
          <span className="nav-icon">🚪</span>Déconnexion
        </button>
      </div>

    </div>
  );
}