import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { ToastContainer } from 'react-toastify';

const NAV_ITEMS = [
    { path: '/',          icon: '📊', label: 'Dashboard',  roles: ['admin', 'it', 'technician', 'employee'], badge: null },
    { path: '/assets',    icon: '💻', label: 'Matériels',  roles: ['admin', 'it', 'technician'], badge: 'maintenance' },
    { path: '/employees', icon: '👥', label: 'Employés',   roles: ['admin', 'it'],               badge: null },
    { path: '/movements', icon: '🔄', label: 'Mouvements', roles: ['admin', 'it', 'technician'], badge: null },
    { path: '/audit',     icon: '📜', label: 'Audit Logs', roles: ['admin', 'it'],               badge: null },
    { path: '/admin',     icon: '⚙️', label: 'Admin Panel',roles: ['admin'],                             badge: null },
    { path: '/agents',    icon: '🤖', label: 'Agents',     roles: ['admin'],                            badge: null } 
];

const BOTTOM_NAV_PATHS = ['/', '/assets', '/employees', '/movements', '/admin', '/agents','/agentsInfo'];

const PAGE_NAMES = {
    '/':          'Dashboard',
    '/assets':    'Matériels',
    '/employees': 'Employés',
    '/movements': 'Mouvements',
    '/audit':     'Audit Logs',
    '/admin':     'Admin Panel',
    '/profile':   'Profil',
    '/agents':    'Agents',
    '/agentsInfo': 'Info Agents',
};

export default function Layout({ children, dark, setDark }) {
    const { state: { auth, assets }, dispatch } = useStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // ── Rôle normalisé ────────────────────────────────────────────
    const role = auth?.role?.toLowerCase() ?? 'employee';

    // ── Filtrer nav selon le rôle ─────────────────────────────────
    const visibleNav    = NAV_ITEMS.filter(item => item.roles.includes(role));
    const visibleBottom = visibleNav.filter(item => BOTTOM_NAV_PATHS.includes(item.path));

    // ── Badge maintenance ─────────────────────────────────────────
    const maintenanceCount = assets.filter(a =>
        a.status === 'maintenance' || a.status === 'En réparation'
    ).length;

    const getBadge = (item) => {
        if (item.badge === 'maintenance') return maintenanceCount;
        return 0;
    };

    useEffect(() => {
        document.body.classList.toggle('light-mode', !dark);
    }, [dark]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const currentName = PAGE_NAMES[location.pathname] ?? 'Dashboard';

    return (
        <div className="app">
            {sidebarOpen && (
                <div className="sidebar-overlay visible" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-badge">
                        <div className="logo-icon">IT</div>
                        <div className="logo-text">
                            IT Inventory
                            <div className="logo-sub">Management System</div>
                        </div>
                    </div>
                </div>

                <div className="store-sidebar-info">
                    <div className="store-sidebar-row">
                        <span className="store-dot" />
                        <span style={{ fontSize: 10, color: 'var(--accent2)', fontFamily: 'monospace', fontWeight: 700 }}>
                            STORE ACTIF
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>
                            {assets.length} assets
                        </span>
                    </div>
                </div>

                <div className="nav-section">
                    <div className="nav-label">Navigation</div>
                    {visibleNav.map(item => {
                        const badge = getBadge(item);
                        return (
                            <button
                                key={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                                {badge > 0 && (
                                    <span className="nbadge warn">{badge}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="sidebar-footer">
                    <div
                        className="user-card"
                        onClick={() => navigate('/profile')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="avatar">
                            {auth?.user?.name?.[0]?.toUpperCase() ?? auth.role?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{auth?.user?.name ?? auth.role}</div>
                            <div className="user-role">
                                {NAV_ITEMS.find(() => true) && (
                                    <span style={{ color: 'var(--accent)', fontSize: 10 }}>
                                        {auth.role}
                                    </span>
                                )} · connecté
                            </div>
                        </div>
                    </div>
                    <button
                        className="nav-item"
                        style={{ marginTop: 6 }}
                        onClick={() => {
                            localStorage.removeItem('token');
                            dispatch({ type: 'LOGOUT' });
                        }}
                    >
                        <span className="nav-icon">🚪</span>Déconnexion
                    </button>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="main">
                <div className="topbar">
                    <button
                        className={`hamburger ${sidebarOpen ? 'open' : ''}`}
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label="Menu"
                    >
                        <span /><span /><span />
                    </button>
                    <div>
                        <div className="topbar-title">{currentName}</div>
                        <div className="topbar-breadcrumb">
                            <span>IT Inventory</span><span>›</span><span>{currentName}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                        <span className="role-label" style={{ fontSize: 11, color: 'var(--text3)' }}>
                            <span style={{ color: 'var(--accent2)', fontFamily: 'monospace', fontSize: 10 }}>▸</span>
                            {' '}
                            <span style={{ color: 'var(--accent)' }}>{auth.role}</span>
                        </span>
                        <button
                            className={`theme-toggle ${dark ? 'dark' : ''}`}
                            onClick={() => setDark(d => !d)}
                        >
                            <div className="toggle-track"><div className="toggle-knob" /></div>
                            <span className="toggle-text">{dark ? '🌙' : '☀️'}</span>
                        </button>
                    </div>
                </div>

                {children}
            </div>

            {/* ── Bottom Nav mobile ── */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    {visibleBottom.map(item => {
                        const badge = getBadge(item);
                        return (
                            <button
                                key={item.path}
                                className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {badge > 0 && <span className="bottom-nav-badge">{badge}</span>}
                                <span className="bottom-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <ToastContainer />
        </div>
    );
}