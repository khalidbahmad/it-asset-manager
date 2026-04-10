import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { getAuditBySerial } from "../api/audit.api";
import { useNavigate } from "react-router-dom";

const ACTION_COLOR = {
    create: '#38d9a9', update: '#4dabf7',
    delete: '#ff5c5c', assign: '#a78bfa', return: '#ffd43b',
};
const ACTION_LABEL = {
    create: 'Création', update: 'Modification',
    delete: 'Suppression', assign: 'Affectation', return: 'Retour',
};

function normalizeLog(l) {
    if (l.table_name) {
        const assetTag = l.asset_tag + ' - ' + l.serial_number ?? `#${l.record_id}`;
        return {
            id:     l.id,
            action: `${ACTION_LABEL[l.action] ?? l.action} — ${assetTag} (${l.table_name})`,
            user:   `user #${l.user_id}`,
            time:   new Date(l.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
            dot:    ACTION_COLOR[l.action] ?? '#888',
            raw:    l,
            assetTag: l.asset_tag ?? assetTag,
            serialNumber: l.serial_number

        };
    }
    return { id: l.id, action: l.action ?? '—', user: l.user ?? '—', time: l.time ?? '', dot: l.dot ?? '#888', raw: l };
}

function AuditPage() {
    const { state: { auditLogs } } = useStore();
    const navigate = useNavigate();

    const [search,      setSearch]      = useState('');
    const [loading,     setLoading]     = useState(false);
    const [searchAsset, setSearchAsset] = useState(null);
    const [searchLogs,  setSearchLogs]  = useState(null);
    const [error,       setError]       = useState('');
    const [selected,    setSelected]    = useState(null);

    const logs = [...(auditLogs ?? [])].map(normalizeLog).sort((a, b) => b.id - a.id);
    const displayLogs = searchLogs ?? logs;

    async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;

        // ← filtre local, pas d'appel API
        const filtered = logs.filter(l =>
            l.serialNumber?.toLowerCase().includes(search.trim().toLowerCase()) ||
            l.assetTag?.toLowerCase().includes(search.trim().toLowerCase())
        );

        setSearchLogs(filtered);
        setError(filtered.length === 0 ? 'Aucun résultat trouvé' : '');
    }

    function clearSearch() {
        setSearch('');
        setSearchAsset(null);
        setSearchLogs(null);
        setError('');
        setSelected(null);
    }

    return (
        <div className="content">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">AUDIT ({displayLogs.length} entrées)</div>
                    <div className="card-actions" style={{ gap: 8 }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="N° Série..."
                                style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, width: 140 }}
                            />
                            <button className="topbar-btn primary" type="submit" style={{ padding: '4px 10px' }}>
                                {loading ? '...' : '🔍'}
                            </button>
                            {searchLogs !== null && (
                                <button className="topbar-btn" type="button" onClick={clearSearch} style={{ padding: '4px 10px' }}>✕</button>
                            )}
                        </form>
                    </div>
                </div>
                        

                {/* Erreur */}
                {error && (
                    <div style={{ padding: '10px 16px', color: '#ff5c5c', fontSize: 12 }}>{error}</div>
                )}

                {/* Liste logs */}
                {/* {console.log(displayLogs)} */}
                <div className="log-list">
                    {displayLogs.length === 0 && !loading && (
                        <div style={{ padding: '20px', color: 'var(--text3)', fontSize: 13 }}>Aucune entrée</div>
                    )}
                    {displayLogs.map((l, i) => (
                        <div
                            key={l.id}
                            className="log-item"
                            style={{ cursor: 'pointer', background: selected?.id === l.id ? 'var(--bg2)' : 'transparent' }}
                            onClick={() => setSelected(selected?.id === l.id ? null : l)}
                        >
                            <div className="log-dot-wrap">
                                <div className="log-dot" style={{ background: l.dot }} />
                                {i < displayLogs.length - 1 && <div className="log-line" />}
                            </div>
                            <div className="log-content">
                                <div className="log-action">{l.action}</div>
                                <div className="log-meta">
                                    <span>par {l.user}</span>
                                    <span>{l.time}</span>
                                </div>
                                <button
                                    className="topbar-btn primary"
                                    onClick={() => navigate(`/assets/${l.serialNumber}/history`)}
                                    style={{ marginLeft: 'auto', fontSize: 11 }}
                                >
                                    Voir →
                                </button>

                                {selected?.id === l.id && l.raw && (
                                    <div style={{
                                        marginTop: 8,
                                        padding: '8px 12px',
                                        background: 'var(--bg3)',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontFamily: 'Space Mono, monospace',
                                        color: 'var(--text2)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                    }}>
                                        {l.raw.old_data && (
                                            <div style={{ marginBottom: 6 }}>
                                                <span style={{ color: '#ff5c5c' }}>AVANT : </span>
                                                {JSON.stringify(l.raw.old_data, null, 2)}
                                            </div>
                                        )}
                                        {l.raw.new_data && (
                                            <div>
                                                <span style={{ color: '#38d9a9' }}>APRÈS : </span>
                                                {JSON.stringify(l.raw.new_data, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AuditPage;