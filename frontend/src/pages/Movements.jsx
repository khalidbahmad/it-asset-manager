import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";

function MovementsPage() {
    const { state: { movements, assets, locations } } = useStore();

    // ── Résolveurs ────────────────────────────────────────────────
    const assetTag    = (id) => assets?.find(a => a.id === id)?.asset_tag       ?? `Asset #${id}`;
    const locationName = (id) => locations?.find(l => l.id === id)?.name        ?? `Site #${id}`;
    const formatDate  = (d)  => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

    const typeIcon = {
        transfer: '🔀',
        assign:   '📋',
        return:   '↩️',
    };
    const typeLabel = {
        transfer: 'Transfert',
        assign:   'Affectation',
        return:   'Retour',
    };

    return (
        <div className="content">
            <StorePanel />
            <div className="card">
                <div className="card-header">
                    <div className="card-title">MOUVEMENTS ({movements?.length ?? 0})</div>
                    <div className="card-actions">
                        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>store.movements</span>
                    </div>
                </div>

                {(!movements || movements.length === 0) && (
                    <div style={{ padding: '20px', color: 'var(--text3)', fontSize: 13 }}>Aucun mouvement enregistré</div>
                )}

                {movements?.map(m => (
                    <div key={m.id} className="move-item">
                        <div className={`move-icon ${m.movement_type ?? 'transfer'}`}>
                            {typeIcon[m.movement_type] ?? '🔀'}
                        </div>
                        <div className="move-info">
                            <div className="move-title">
                                <strong>{assetTag(m.asset_id)}</strong>
                                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text3)' }}>
                                    {typeLabel[m.movement_type] ?? m.movement_type}
                                </span>
                            </div>
                            <div className="move-sub">
                                {locationName(m.from_location_id)} → {locationName(m.to_location_id)}
                            </div>
                            {m.reason && (
                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                                    {m.reason}
                                </div>
                            )}
                        </div>
                        <div className="move-time">{formatDate(m.moved_at)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovementsPage;