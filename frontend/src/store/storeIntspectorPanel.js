import { useState,useMemo } from "react";
import { useStore } from "./StoreContext";

function StorePanel() {
    const { state } = useStore();
    const [open, setOpen] = useState(false);
    const { assets, employees, movements, auditLogs, actionLog } = state;

    // ← Plus de dispatch ici — useData s'en charge au montage de l'app

    const s = useMemo(() => ({
        total:       assets.length,
        available:   assets.filter(a => a.status === 'available').length,
        assigned:    assets.filter(a => a.status === 'assigned').length,
        maintenance: assets.filter(a => a.status === 'maintenance').length,
        retired:     assets.filter(a => a.status === 'retired').length,
        employees:   employees?.length ?? 0,
        movements:   movements?.length ?? 0,
        logs:        auditLogs?.length  ?? 0,
    }), [assets, employees, movements, auditLogs]);

    return (
        <div className="store-panel">
            <div className="store-panel-header" onClick={() => setOpen(o => !o)}>
                <span className="store-badge"><span className="store-dot" />STORE</span>
                <span className="store-panel-title">Global State — Context + useReducer</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--accent2)', fontFamily: 'Space Mono,monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {actionLog?.[0] ? `▸ ${actionLog[0].type}` : 'aucune action'}
                </span>
                <span style={{ marginLeft: 10, color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
            </div>
            {open && <>
                <div className="store-panel-body">
                    <div className="store-chip">assets: <strong style={{ color: 'var(--text)' }}>{s.total}</strong></div>
                    <div className="store-chip">available: <strong style={{ color: 'var(--accent2)' }}>{s.available}</strong></div>
                    <div className="store-chip">assigned: <strong style={{ color: 'var(--accent)' }}>{s.assigned}</strong></div>
                    <div className="store-chip">maintenance: <strong style={{ color: 'var(--accent3)' }}>{s.maintenance}</strong></div>
                    <div className="store-chip">retired: <strong style={{ color: 'var(--danger)' }}>{s.retired}</strong></div>
                    <div className="store-chip">employees: <strong style={{ color: 'var(--text)' }}>{s.employees}</strong></div>
                    <div className="store-chip">movements: <strong style={{ color: 'var(--text)' }}>{s.movements}</strong></div>
                    <div className="store-chip">auditLogs: <strong style={{ color: 'var(--text)' }}>{s.logs}</strong></div>
                </div>
                <div className="store-action-log">
                    {(!actionLog || actionLog.length === 0) && (
                        <div style={{ color: 'var(--text3)', padding: '4px 0', fontSize: 10 }}>Aucune action dispatchée</div>
                    )}
                    {actionLog?.map((a, i) => (
                        <div key={i} className="slog-item">
                            <span className="slog-type">{a.type}</span>
                            <span className="slog-label">{a.label}</span>
                            <span className="slog-time">{a.time}</span>
                        </div>
                    ))}
                </div>
            </>}
        </div>
    );
}

/* ── Toast Container ── */
function ToastContainer(){
  const {state:{toasts}} = useStore();
  return <div className="toast-container">{toasts.map(t=><div key={t.id} className={`toast ${t.type}`}><span>{t.icon}</span>{t.msg}</div>)}</div>;
}

export {StorePanel,ToastContainer};