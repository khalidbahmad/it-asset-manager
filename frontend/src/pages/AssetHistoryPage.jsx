import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuditBySerial } from "../api/audit.api";

const ACTION_COLOR = {
    create: '#38d9a9', update: '#4dabf7',
    delete: '#ff5c5c', assign: '#a78bfa', return: '#ffd43b',
};
const ACTION_LABEL = {
    create: 'Création', update: 'Modification',
    delete: 'Suppression', assign: 'Affectation', return: 'Retour',
};
const TABLE_LABEL = {
    assets: 'Asset', assignments: 'Affectation',
    employees: 'Employé', departments: 'Département',
};
const FIELD_LABELS = {
    asset_tag: 'Tag', serial_number: 'N° Série', model: 'Modèle',
    description: 'Description', status_id: 'Statut ID', brand_id: 'Marque ID',
    category_id: 'Catégorie ID', location_id: 'Site ID', is_assignable: 'Assignable',
    purchase_date: 'Date achat', warranty_end_date: 'Fin garantie',
    created_at: 'Créé le', updated_at: 'Modifié le',
    asset_id: 'Asset ID', agence_id: 'Agence ID', employee_id: 'Employé ID',
    department_id: 'Dép. ID', seat_id: 'Poste ID', assigned_at: 'Affecté le',
    status: 'Statut',
};

function DiffView({ oldData, newData }) {
    if (!oldData && !newData) return null;
    const allKeys = [...new Set([
        ...Object.keys(oldData ?? {}),
        ...Object.keys(newData ?? {}),
    ])].filter(k => k !== 'id');
    const rows = (oldData && newData)
        ? allKeys.filter(k => JSON.stringify(oldData[k]) !== JSON.stringify(newData[k]))
        : allKeys;

    if (rows.length === 0) return null;

    return (
        <div style={{ marginTop: 10, borderRadius: 6, overflow: 'hidden', border: '0.5px solid var(--color-border-tertiary)', fontSize: 11 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--color-background-secondary)', padding: '5px 10px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                <span>Champ</span>
                {oldData && <span style={{ color: '#ff5c5c' }}>Avant</span>}
                <span style={{ color: '#38d9a9' }}>{oldData ? 'Après' : 'Valeur'}</span>
            </div>
            {rows.map((key, i) => {
                const oldVal = oldData?.[key];
                const newVal = newData?.[key];
                const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                return (
                    <div key={key} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        padding: '4px 10px',
                        background: i % 2 === 0 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
                        borderTop: '0.5px solid var(--color-border-tertiary)',
                    }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {FIELD_LABELS[key] ?? key}
                        </span>
                        {oldData && (
                            <span style={{ color: '#ff5c5c', fontFamily: 'var(--font-mono)', textDecoration: 'line-through', opacity: 0.8 }}>
                                {oldVal == null ? '—' : String(oldVal)}
                            </span>
                        )}
                        <span style={{ color: isChanged ? '#38d9a9' : 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontWeight: isChanged ? 500 : 400 }}>
                            {newVal == null ? '—' : String(newVal)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function normalizeLog(l) {
    const assetTag = l.asset_tag ?? l.new_data?.asset_tag ?? `#${l.record_id}`;
    return {
        id:        l.id,
        action:    ACTION_LABEL[l.action] ?? l.action,
        actionKey: l.action,
        table:     TABLE_LABEL[l.table_name] ?? l.table_name,
        label:     `${ACTION_LABEL[l.action] ?? l.action}`,
        tag:       assetTag,
        user:      l.user?.name ?? `user #${l.user_id}`,
        time:      new Date(l.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        dot:       ACTION_COLOR[l.action] ?? '#888',
        old_data:  l.old_data,
        new_data:  l.new_data,
    };
}

function TimelineCard({ log, isOpen, onToggle, isLast }) {
    const dotColor = log.dot;
    return (
        <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {/* ── Ligne verticale + dot ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: dotColor, flexShrink: 0,
                    border: '2px solid var(--color-background-primary)',
                    boxSizing: 'border-box', marginTop: 16,
                }} />
                {!isLast && (
                    <div style={{ width: 2, flex: 1, background: 'var(--color-border-tertiary)', minHeight: 24 }} />
                )}
            </div>

            {/* ── Card ── */}
            <div style={{
                flex: 1,
                margin: '8px 0 8px 8px',
                borderRadius: 10,
                border: '0.5px solid var(--color-border-tertiary)',
                background: 'var(--color-background-primary)',
                overflow: 'hidden',
            }}>
                {/* Card header */}
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }}
                    onClick={onToggle}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Action badge */}
                        <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20,
                            background: dotColor + '22', color: dotColor,
                            border: `1px solid ${dotColor}44`, fontWeight: 500,
                        }}>
                            {log.label}
                        </span>
                        {/* Table badge */}
                        <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20,
                            background: 'var(--color-background-secondary)',
                            color: 'var(--color-text-secondary)',
                            border: '0.5px solid var(--color-border-tertiary)',
                        }}>
                            {log.table}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {log.tag}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                        <span>{log.user}</span>
                        <span>{log.time}</span>
                        {(log.old_data || log.new_data) && (
                            <span style={{ fontSize: 10 }}>{isOpen ? '▲' : '▼'}</span>
                        )}
                    </div>
                </div>

                {/* Diff expandable */}
                {isOpen && (
                    <div style={{ padding: '0 14px 12px' }}>
                        <DiffView oldData={log.old_data} newData={log.new_data} />
                    </div>
                )}
            </div>
        </div>
    );
}

function AssetHistoryPage() {
    const { serial } = useParams();
    const navigate   = useNavigate();

    const [asset,   setAsset]   = useState(null);
    const [logs,    setLogs]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [openId,  setOpenId]  = useState(null);

    useEffect(() => {
        if (!serial) return;
        setLoading(true);
        getAuditBySerial(serial)
            .then(res => {
                setAsset(res.data.asset);
                const logsArray = Object.values(res.data.logs).flat();
                setLogs(logsArray.map(normalizeLog).sort((a, b) => b.id - a.id));
            })
            .catch(err => setError(err?.response?.data?.error ?? 'Asset introuvable'))
            .finally(() => setLoading(false));
    }, [serial]);

    return (
        <div className="content">
            {/* ── Back ── */}
            <button
                className="topbar-btn"
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
                ← Retour
            </button>

            {loading && <div style={{ padding: 20, color: 'var(--text3)', fontSize: 13 }}>Chargement...</div>}
            {error   && <div style={{ padding: 20, color: '#ff5c5c', fontSize: 13 }}>{error}</div>}

            {/* ── Asset info card ── */}
            {asset && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <div className="card-title">ASSET — {asset.asset_tag}</div>
                        <span style={{
                            fontSize: 11, padding: '3px 12px', borderRadius: 20,
                            background: asset.status?.name === 'Affecté' ? '#38d9a922' : 'var(--color-background-secondary)',
                            color:      asset.status?.name === 'Affecté' ? '#38d9a9'   : 'var(--color-text-secondary)',
                            border: '1px solid currentColor',
                        }}>
                            {asset.status?.name}
                        </span>
                    </div>
                    <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                        {[
                            ['N° Série',  asset.serial_number],
                            ['Tag',       asset.asset_tag],
                            ['Modèle',    asset.model],
                            ['Marque',    asset.brand?.name],
                            ['Catégorie', asset.category?.name],
                            ['Site',      asset.location?.name],
                        ].map(([label, value]) => (
                            <div key={label} style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '8px 12px' }}>
                                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value ?? '—'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Timeline ── */}
            {!loading && logs.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">HISTORIQUE</div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {logs.length} entrées
                        </span>
                    </div>
                    <div style={{ padding: '8px 16px 16px' }}>
                        {logs.map((l, i) => (
                            <TimelineCard
                                key={l.id}
                                log={l}
                                isOpen={openId === l.id}
                                onToggle={() => setOpenId(openId === l.id ? null : l.id)}
                                isLast={i === logs.length - 1}
                            />
                        ))}
                    </div>
                </div>
            )}

            {!loading && !error && logs.length === 0 && (
                <div style={{ padding: 20, color: 'var(--color-text-tertiary)', fontSize: 13 }}>Aucun historique trouvé.</div>
            )}
        </div>
    );
}

export default AssetHistoryPage;