const PAGE_NAMES = {
  '/':          'Dashboard',
  '/assets':    'Matériels',
  '/employees': 'Employés',
  '/movements': 'Mouvements',
  '/audit':     'Audit Logs',
  '/admin':     'Admin Panel',
};

export default function Topbar({ currentPath, role, dark, onToggleTheme, onToggleSidebar, sidebarOpen }) {
  const pageName = PAGE_NAMES[currentPath] ?? 'Dashboard';

  return (
    <div className="topbar">

      {/* Hamburger mobile */}
      <button
        className={`hamburger ${sidebarOpen ? 'open' : ''}`}
        onClick={onToggleSidebar}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      {/* Titre + breadcrumb */}
      <div>
        <div className="topbar-title">{pageName}</div>
        <div className="topbar-breadcrumb">
          <span>IT Inventory</span>
          <span>›</span>
          <span>{pageName}</span>
        </div>
      </div>

      {/* Droite : rôle + toggle thème */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <span className="role-label" style={{ fontSize: 11, color: 'var(--text3)' }}>
          <span style={{ color: 'var(--accent2)', fontFamily: 'monospace', fontSize: 10 }}>▸</span>
          {' '}
          <span style={{ color: 'var(--accent)' }}>{role}</span>
        </span>

        <button
          className={`theme-toggle ${dark ? 'dark' : ''}`}
          onClick={onToggleTheme}
        >
          <div className="toggle-track">
            <div className="toggle-knob" />
          </div>
          <span className="toggle-text">{dark ? '🌙' : '☀️'}</span>
        </button>
      </div>

    </div>
  );
}