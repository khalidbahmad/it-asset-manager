import { useStore } from './store/StoreContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AssetsPage from './pages/Assets';
import EmployeesPage from './pages/Employees';
import MovementsPage from './pages/Movements';
import AuditPage from './pages/AuditLogs';
import AdminPage from './pages/AdminPanel';
import AgentsPage from './pages/AgentsPage';
import AgentsInfoPage from './pages/AgentsInfoPage';
import ProfilePage from './pages/ProfilePage';
import AddAgencePage from './pages/AddAgencePage';
import { useState } from 'react';
import { useData } from './hooks/useData';

// ── Permissions par rôle ──────────────────────────────────────────────
const ROLE_PERMISSIONS = {
    admin: {
        routes:   ['/', '/assets', '/employees', '/movements', '/audit', '/admin', '/profile', '/agents','/agentsInfo', '/agences/new'],
        label:    'Administrateur',
    },
    it: {
        routes:   ['/', '/assets', '/employees', '/movements', '/audit', '/profile'],
        label:    'IT Manager',
    },
    technician: {
        routes:   ['/', '/assets', '/movements', '/profile'],
        label:    'Technicien',
    },
    employee: {
        routes:   ['/', '/profile'],
        label:    'Employé',
    },
};

function hasAccess(role, path) {
    const key  = role?.toLowerCase() ?? '';
    const perm = ROLE_PERMISSIONS[key] ?? ROLE_PERMISSIONS['employee'];
    return perm.routes.some(r => path === r || path.startsWith(r + '/'));
}

// ── Guard de route ────────────────────────────────────────────────────
function Guard({ role, path, element }) {
    return hasAccess(role, path) ? element : <Navigate to="/" replace />;
}

function AuthenticatedApp({ dark, setDark, auth }) {
    useData();
    const role = auth.role?.toLowerCase() ?? 'employee';

    return (
        <Layout dark={dark} setDark={setDark}>
            <Routes>
                {/* ── Accessible à tous les rôles connectés ── */}
                <Route path="/" element={<Dashboard />} />

                <Route path="/profile" element={<ProfilePage />} />

                {/* ── Assets : admin, it manager, technicien ── */}
                <Route path="/assets" element={
                    <Guard role={role} path="/assets" element={<AssetsPage />} />
                } />

                {/* ── Employees : admin, it manager ── */}
                <Route path="/employees" element={
                    <Guard role={role} path="/employees" element={<EmployeesPage />} />
                } />

                {/* ── Movements : admin, it manager, technicien ── */}
                <Route path="/movements" element={
                    <Guard role={role} path="/movements" element={<MovementsPage />} />
                } />

                {/* ── Audit : admin, it manager ── */}
                <Route path="/audit" element={
                    <Guard role={role} path="/audit" element={<AuditPage />} />
                } />

                {/* ── Admin : admin seulement ── */}
                <Route path="/admin" element={
                    <Guard role={role} path="/admin" element={<AdminPage />} />
                } />

                {/* ── Agents : accessible à tous les rôles connectés ── */}
                <Route path="/admin" element={
                    <Guard role={role} path="/admin" element={<AdminPage />} />
                } />

                <Route path="/agents" element={
                    <Guard role={role} path="/agents" element={<AgentsPage />} />
                } />

                <Route path="/agentsInfo/:id" element={
                    <Guard role={role} path="/agentsInfo" element={<AgentsInfoPage />} />
                } />

                <Route path="/agences/new" element={
                    <Guard role={role} path="/agences/new" element={<AddAgencePage />} />
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default function App() {
    const { state: { auth } } = useStore();
    const [dark, setDark] = useState(true);
    console.log('Auth state:', auth);

    if (!auth.loggedIn) {
        return (
            <Routes>
                <Route path="/signup" element={<SignUp dark={dark} setDark={setDark} />} />
                <Route path="*"       element={<LoginPage dark={dark} setDark={setDark} />} />
            </Routes>
        );
    }

    return <AuthenticatedApp dark={dark} setDark={setDark} auth={auth} />;
}