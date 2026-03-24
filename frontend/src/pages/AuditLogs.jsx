import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";

const ACTION_COLOR = {
    create:  '#38d9a9',
    update:  '#4dabf7',
    delete:  '#ff5c5c',
    assign:  '#a78bfa',
    return:  '#ffd43b',
};

const ACTION_LABEL = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression',
    assign: 'Affectation',
    return: 'Retour',
};

function normalizeLog(l) {
    // ── Format Laravel (vient de l'API) ──────────────────────────
    if (l.table_name) {
        const assetTag = l.new_data?.asset_tag ?? l.old_data?.asset_tag ?? `#${l.record_id}`;
        return {
            id:     l.id,
            action: `${ACTION_LABEL[l.action] ?? l.action} — ${assetTag} (${l.table_name})`,
            user:   `user #${l.user_id}`,
            time:   new Date(l.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
            dot:    ACTION_COLOR[l.action] ?? '#888',
        };
    }
    // ── Format store local (dispatché en front) ──────────────────
    return {
        id:     l.id,
        action: l.action ?? '—',
        user:   l.user   ?? '—',
        time:   l.time   ?? '',
        dot:    l.dot    ?? '#888',
    };
}

function AuditPage() {
    const { state: { auditLogs } } = useStore();

    const logs = [...(auditLogs ?? [])]
        .map(normalizeLog)
        .sort((a, b) => b.id - a.id); // plus récent en premier

    return (
        <div className="content">
            <StorePanel />
            <div className="card">
                <div className="card-header">
                    <div className="card-title">AUDIT ({logs.length} entrées)</div>
                    <div className="card-actions">
                        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>store.auditLogs</span>
                    </div>
                </div>
                <div className="log-list">
                    {logs.length === 0 && (
                        <div style={{ padding: '20px', color: 'var(--text3)', fontSize: 13 }}>Aucune entrée</div>
                    )}
                    {logs.map((l, i) => (
                        <div key={l.id} className="log-item">
                            <div className="log-dot-wrap">
                                <div className="log-dot" style={{ background: l.dot }} />
                                {i < logs.length - 1 && <div className="log-line" />}
                            </div>
                            <div className="log-content">
                                <div className="log-action">{l.action}</div>
                                <div className="log-meta">
                                    <span>par {l.user}</span>
                                    <span>{l.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AuditPage;