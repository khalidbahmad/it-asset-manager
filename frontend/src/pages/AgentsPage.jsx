import { useMemo, useState } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/ui/Modal";
import client from "../api/axiosClient";
import { AddAgenceModal } from "../components/ui/AddAgenceModal";


// ── Page Agences ──────────────────────────────────────────────────────
export default function AgencesPage() {
    const { state, dispatch } = useStore();
    const navigate = useNavigate();

    const locations = state.agences ?? [];
    const assets    = state.assets    ?? [];
    const statuses  = state.statuses  ?? [];

    const [search,    setSearch]    = useState('');
    const [sortKey,   setSortKey]   = useState('name');
    const [sortDir,   setSortDir]   = useState('asc');

    const { state: { auth } } = useStore();
    const role    = auth?.role?.toLowerCase() ?? 'employee';
    const canEdit = ['admin', 'it manager'].includes(role);

    function toggleSort(key) {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    }

    function SortIcon({ col }) {
        if (sortKey !== col) return <span style={{ opacity: 0.25, fontSize: 10 }}> ⇅</span>;
        return <span style={{ fontSize: 10, color: 'var(--accent)' }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>;
    }

    const thStyle = col => ({
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        color: sortKey === col ? 'var(--accent)' : '',
    });

    const agences = useMemo(() => locations.map(loc => {
        const locAssets = assets.filter(a => a.location_id === loc.id);
        const getStatus = a => a.status?.name ?? a.status ?? statuses.find(s => s.id === a.status_id)?.name ?? '';
        return {
            ...loc,
            total:      locAssets.length,
            disponible: locAssets.filter(a => ['Disponible','available'].includes(getStatus(a))).length,
            affecte:    locAssets.filter(a => ['Affecté','assigned'].includes(getStatus(a))).length,
            reparation: locAssets.filter(a => ['En réparation','maintenance'].includes(getStatus(a))).length,
        };
    }), [locations, assets, statuses]);

    const filtered = useMemo(() => {
        let list = agences.filter(a =>
            !search || a.name.toLowerCase().includes(search.toLowerCase())
                    || (a.address ?? '').toLowerCase().includes(search.toLowerCase())
        );
        return [...list].sort((a, b) => {
            const av = String(a[sortKey] ?? '').toLowerCase();
            const bv = String(b[sortKey] ?? '').toLowerCase();
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [agences, search, sortKey, sortDir]);

    function handleAgenceCreated(newAgence) {
        dispatch({ type: 'ADD_LOCATION', payload: newAgence });
    }

    return (
        <div className="content">
            <button className="topbar-btn primary" onClick={() => navigate('/agences/new')}>
                + Agence
            </button>

            <StorePanel />

            {/* ── KPI ── */}
            <div className="stats-grid" style={{ marginBottom: 14 }}>
                {[
                    { label: 'Total Agences',  value: locations.length,                            dot: 'blue',   color: 'blue'   },
                    { label: 'Total Assets',   value: assets.length,                               dot: 'green',  color: 'green'  },
                    { label: 'Avec matériels', value: agences.filter(a => a.total > 0).length,     dot: 'blue',   color: 'blue'   },
                    { label: 'Sans matériels', value: agences.filter(a => a.total === 0).length,   dot: 'orange', color: 'orange' },
                ].map((c, i) => (
                    <div key={i} className={`stat-card ${c.color}`}>
                        <div className="stat-label">{c.label}</div>
                        <div className="stat-value">{c.value}</div>
                        <div className="stat-meta"><span className={`stat-dot ${c.dot}`} /></div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">AGENCES / SITES</div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                        {filtered.length}/{locations.length}
                    </span>
                    <div className="card-actions">
                        <div className="search-box" style={{ minWidth: 150 }}>
                            <span style={{ color: 'var(--text3)' }}>🔍</span>
                            <input
                                placeholder="Rechercher..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="topbar-btn primary" onClick={() => navigate('/agences/new')}>
                            + Agence
                        </button>
                    </div>
                </div>

                {/* ── Table desktop ── */}
                <div className="desktop-table" style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={thStyle('name')}      onClick={() => toggleSort('name')}>Agence <SortIcon col="name" /></th>
                                <th style={thStyle('address')}   onClick={() => toggleSort('address')}>Adresse <SortIcon col="address" /></th>
                                <th style={thStyle('total')}     onClick={() => toggleSort('total')}>Total <SortIcon col="total" /></th>
                                <th style={thStyle('disponible')}onClick={() => toggleSort('disponible')}>Disponible <SortIcon col="disponible" /></th>
                                <th style={thStyle('affecte')}   onClick={() => toggleSort('affecte')}>Affecté <SortIcon col="affecte" /></th>
                                <th style={thStyle('reparation')}onClick={() => toggleSort('reparation')}>Réparation <SortIcon col="reparation" /></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {console.log(filtered)}
                            {filtered.map(loc => (
                                <tr key={loc.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'var(--accent)', color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 14, flexShrink: 0,
                                            }}>📍</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{loc.Agence}</div>
                                                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                                                    ID #{loc.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>
                                        {loc.Adresse ?? <span style={{ color: 'var(--text3)' }}>—</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: loc.total > 0 ? 'var(--text)' : 'var(--text3)' }}>
                                            {loc.total}
                                        </span>
                                    </td>
                                    <td>
                                        {loc.disponible > 0
                                            ? <span className="tag available"><span className="tag-dot" />{loc.disponible}</span>
                                            : <span style={{ color: 'var(--text3)' }}>—</span>}
                                    </td>
                                    <td>
                                        {loc.affecte > 0
                                            ? <span className="tag assigned"><span className="tag-dot" />{loc.affecte}</span>
                                            : <span style={{ color: 'var(--text3)' }}>—</span>}
                                    </td>
                                    <td>
                                        {loc.reparation > 0
                                            ? <span className="tag maintenance"><span className="tag-dot" />{loc.reparation}</span>
                                            : <span style={{ color: 'var(--text3)' }}>—</span>}
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => navigate(`/agentsInfo/${loc.id}`)}>
                                            Voir →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Cards mobile ── */}
                <div className="asset-cards">
                    {filtered.map(loc => (
                        <div
                            key={loc.id}
                            className="asset-card-m"
                            onClick={() => navigate(`/locations/${loc.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="asset-card-m-top">
                                <div>
                                    <div className="asset-card-m-title">📍 {loc.name}</div>
                                    <div className="asset-card-m-id">{loc.address ?? 'Adresse non renseignée'}</div>
                                </div>
                                <span className="tag available"><span className="tag-dot" />{loc.total} assets</span>
                            </div>
                            <div className="asset-card-m-meta">
                                <span className="meta-pill">✅ {loc.disponible}</span>
                                <span className="meta-pill">📋 {loc.affecte}</span>
                                {loc.reparation > 0 && <span className="meta-pill">🔧 {loc.reparation}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                        Aucune agence trouvée
                    </div>
                )}
            </div>
        </div>
    );
}