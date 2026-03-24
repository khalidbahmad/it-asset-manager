import { useMemo, useState } from "react";
import { useAssets } from "../hooks/useAssets";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import { AddAssetModal } from "../components/ui/Modal";
import { AssignModal } from "../components/forms/AssetForm";
import { useNavigate } from "react-router-dom";

function AssetsPage() {
    const { assets, addAsset, deleteAsset, returnAsset } = useAssets();
    const { state: { auth } } = useStore();
    const navigate = useNavigate();

    const role    = auth?.role?.toLowerCase() ?? 'employee';
    const canEdit = !['employee', 'technicien', 'technician'].includes(role);

    const [filter,     setFilter]     = useState('all');
    const [search,     setSearch]     = useState('');
    const [showAdd,    setShowAdd]    = useState(false);
    const [showAssign, setShowAssign] = useState(null);

    // ── Tri ───────────────────────────────────────────────────────
    const [sortKey, setSortKey]   = useState(null);
    const [sortDir, setSortDir]   = useState('asc');

    function toggleSort(key) {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function SortIcon({ col }) {
        if (sortKey !== col) return <span style={{ opacity: 0.25, fontSize: 10 }}> ⇅</span>;
        return <span style={{ fontSize: 10, color: 'var(--accent)' }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>;
    }

    const thStyle = (col) => ({
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        color: sortKey === col ? 'var(--accent)' : '',
    });

    // ── Status helpers ────────────────────────────────────────────
    const statusClass = s => ({
        'Disponible':    'available',
        'Affecté':       'assigned',
        'En réparation': 'maintenance',
        'Retraité':      'retired',
        'available':     'available',
        'assigned':      'assigned',
        'maintenance':   'maintenance',
        'retired':       'retired',
    }[s] ?? 'available');

    const lbl = s => ({
        'Disponible':    'Disponible',
        'Affecté':       'Affecté',
        'En réparation': 'En réparation',
        'Retraité':      'Retraité',
        'available':     'Disponible',
        'assigned':      'Affecté',
        'maintenance':   'En réparation',
        'retired':       'Retraité',
    }[s] ?? s ?? '—');

    const chips = [
        { l: 'Tous',          v: 'all'           },
        { l: 'Disponible',    v: 'Disponible'    },
        { l: 'Affecté',       v: 'Affecté'       },
        { l: 'En réparation', v: 'En réparation' },
        { l: 'Retraité',      v: 'Retraité'      },
    ];

    // ── Filtre + tri ──────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = assets.filter(a => {
            const mF = filter === 'all' || a.status === filter;
            const mS = !search || (a.tag + a.model + a.brand + a.category)
                .toLowerCase().includes(search.toLowerCase());
            return mF && mS;
        });

        if (sortKey) {
            list = [...list].sort((a, b) => {
                const av = (a[sortKey] ?? '').toString().toLowerCase();
                const bv = (b[sortKey] ?? '').toString().toLowerCase();
                return sortDir === 'asc'
                    ? av.localeCompare(bv)
                    : bv.localeCompare(av);
            });
        }

        return list;
    }, [assets, filter, search, sortKey, sortDir]);

    return (
        <div className="content">
            {showAdd && (
                <AddAssetModal onClose={() => setShowAdd(false)} onSubmit={addAsset} />
            )}
            {showAssign && (
                <AssignModal
                    asset={showAssign}
                    onClose={() => setShowAssign(null)}
                    onSubmit={() => setShowAssign(null)}
                />
            )}
            <StorePanel />

            <div className="card">
                <div className="card-header">
                    <div className="card-title">MATÉRIELS</div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                        {filtered.length}/{assets.length}
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
                        {canEdit && (
                            <button className="topbar-btn primary" onClick={() => setShowAdd(true)}>
                                + Ajouter
                            </button>
                        )}
                    </div>
                </div>

                <div className="filter-bar">
                    {chips.map(c => (
                        <button
                            key={c.v}
                            className={`filter-chip ${filter === c.v ? 'active' : ''}`}
                            onClick={() => setFilter(c.v)}
                        >{c.l}</button>
                    ))}
                </div>

                {/* ── Table desktop ── */}
                <div className="desktop-table" style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={thStyle('tag')} onClick={() => toggleSort('tag')}>
                                    N° Inventaire <SortIcon col="tag" />
                                </th>
                                <th style={thStyle('model')} onClick={() => toggleSort('model')}>
                                    Modèle <SortIcon col="model" />
                                </th>
                                <th style={thStyle('category')} onClick={() => toggleSort('category')}>
                                    Catégorie <SortIcon col="category" />
                                </th>
                                <th style={thStyle('brand')} onClick={() => toggleSort('brand')}>
                                    Marque <SortIcon col="brand" />
                                </th>
                                <th style={thStyle('location')} onClick={() => toggleSort('location')}>
                                    Site / Agence <SortIcon col="location" />
                                </th>
                                <th style={thStyle('status')} onClick={() => toggleSort('status')}>
                                    Statut <SortIcon col="status" />
                                </th>
                                <th style={thStyle('assignedTo')} onClick={() => toggleSort('assignedTo')}>
                                    Affecté à <SortIcon col="assignedTo" />
                                </th>
                                {canEdit && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr key={a.id}>

                                    {/* ── N° Inventaire ── */}
                                    <td>
                                        <div className="asset-id" style={{ fontFamily: 'Space Mono,monospace', fontSize: 11 }}>
                                            {a.tag}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{a.serial}</div>
                                    </td>

                                    {/* ── Modèle ── */}
                                    <td>
                                        <div className="asset-name" style={{ fontWeight: 600 }}>{a.model}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{a.description}</div>
                                    </td>

                                    {/* ── Catégorie ── */}
                                    <td>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'var(--bg3)', borderRadius: 5,
                                            padding: '2px 8px', fontSize: 11, color: 'var(--text2)',
                                        }}>
                                            📂 {a.category}
                                        </span>
                                    </td>

                                    {/* ── Marque ── */}
                                    <td>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'var(--bg3)', borderRadius: 5,
                                            padding: '2px 8px', fontSize: 11, color: 'var(--text2)',
                                        }}>
                                            🏷️ {a.brand}
                                        </span>
                                    </td>

                                    {/* ── Site — cliquable → page agence ── */}
                                    <td>
                                        <span
                                            onClick={() => navigate(`/locations/${a.location_id}`)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                background: 'var(--bg3)', borderRadius: 5,
                                                padding: '2px 8px', fontSize: 11,
                                                color: 'var(--accent)', cursor: 'pointer',
                                                textDecoration: 'underline dotted',
                                            }}
                                            title="Voir l'agence"
                                        >
                                            📍 {a.location}
                                        </span>
                                    </td>

                                    {/* ── Statut ── */}
                                    <td>
                                        <span className={`tag ${statusClass(a.status)}`}>
                                            <span className="tag-dot" />{lbl(a.status)}
                                        </span>
                                    </td>

                                    {/* ── Affecté à ── */}
                                    <td style={{ fontSize: 12, color: a.assignedTo ? 'var(--text)' : 'var(--text3)' }}>
                                        {a.assignedTo
                                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {a.assignedType === 'employee'   && '👤'}
                                                {a.assignedType === 'department' && '🏢'}
                                                {a.assignedType === 'seat'       && '💺'}
                                                {' '}{a.assignedTo}
                                              </span>
                                            : '—'
                                        }
                                    </td>

                                    {/* ── Actions ── */}
                                    {canEdit && (
                                        <td>
                                            <div style={{ display: 'flex', gap: 5 }}>
                                                {a.status === 'Disponible' && (
                                                    <button className="action-btn" onClick={() => setShowAssign(a)}>
                                                        📋 Affecter
                                                    </button>
                                                )}
                                                {a.status === 'Affecté' && (
                                                    <button className="action-btn" onClick={() => returnAsset(a)}>
                                                        ↩️ Retourner
                                                    </button>
                                                )}
                                                <button className="action-btn danger" onClick={() => deleteAsset(a)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Cards mobile ── */}
                <div className="asset-cards">
                    {filtered.map(a => (
                        <div key={a.id} className="asset-card-m">
                            <div className="asset-card-m-top">
                                <div>
                                    <div className="asset-card-m-title">{a.model}</div>
                                    <div className="asset-card-m-id" style={{ fontFamily: 'Space Mono,monospace', fontSize: 10 }}>
                                        {a.tag} · {a.serial}
                                    </div>
                                </div>
                                <span className={`tag ${statusClass(a.status)}`}>
                                    <span className="tag-dot" />{lbl(a.status).slice(0, 9)}
                                </span>
                            </div>
                            <div className="asset-card-m-meta">
                                <span className="meta-pill">📂 {a.category}</span>
                                <span className="meta-pill">🏷️ {a.brand}</span>
                                <span
                                    className="meta-pill"
                                    onClick={() => navigate(`/locations/${a.location_id}`)}
                                    style={{ color: 'var(--accent)', cursor: 'pointer' }}
                                >
                                    📍 {a.location}
                                </span>
                                {a.assignedTo && (
                                    <span className="meta-pill">
                                        {a.assignedType === 'employee'   ? '👤' : ''}
                                        {a.assignedType === 'department' ? '🏢' : ''}
                                        {a.assignedType === 'seat'       ? '💺' : ''}
                                        {' '}{a.assignedTo}
                                    </span>
                                )}
                            </div>
                            <div className="asset-card-m-footer">
                                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                                    {a.purchase ? `Achat : ${a.purchase}` : ''}
                                </div>
                                {canEdit && (
                                    <div className="asset-card-m-actions">
                                        {a.status === 'Disponible' && (
                                            <button className="action-btn" onClick={() => setShowAssign(a)}>
                                                Affecter
                                            </button>
                                        )}
                                        {a.status === 'Affecté' && (
                                            <button className="action-btn" onClick={() => returnAsset(a)}>
                                                Retour
                                            </button>
                                        )}
                                        <button className="action-btn danger" onClick={() => deleteAsset(a)}>✕</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Aucun résultat ── */}
                {filtered.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                        Aucun matériel trouvé
                    </div>
                )}
            </div>
        </div>
    );
}

export default AssetsPage;