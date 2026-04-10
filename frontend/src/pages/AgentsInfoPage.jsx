import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import client from "../api/axiosClient";

export default function AgentsInfoPage() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const { toast }  = useStore();

    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab,     setTab]     = useState('assets');

    useEffect(() => {
        client.get(`/agences/${id}`)
            .then(res => setData(res.data))
            .catch(() => toast('error', '❌', 'Agence introuvable'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>Chargement...</div>
        </div>
    );

    if (!data) return (
        <div className="content">
            <div style={{ color: 'var(--danger)', padding: 20 }}>Agence introuvable</div>
        </div>
    );

    const { agence, info, ville, active_assets, historique, stats, audit_logs } = data;

    const tabs = [
        { v: 'assets',     l: `💻 Assets actifs (${stats.active_assets})`     },
        { v: 'historique', l: `📋 Historique (${stats.total_assignments})`     },
        { v: 'info',       l: '🏢 Informations'                                },
        { v: 'audit',      l: `📜 Audit (${audit_logs?.length ?? 0})`          },
    ];
    console.log(data);
    return (
        <div className="content">
            <StorePanel />

            {/* ── Header ── */}
            <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: 'var(--accent)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, flexShrink: 0,
                        }}>📍</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                                {agence.Agence}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                                {agence.Adresse}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                {info?.etat_agence && (
                                    <span className={`tag ${info.etat_agence === 'Active' ? 'available' : 'maintenance'}`}>
                                        <span className="tag-dot" />{info.etat_agence}
                                    </span>
                                )}
                                {info?.type_agence && (
                                    <span className="tag retired">🏢 {info.type_agence}</span>
                                )}
                                {ville && (
                                    <span className="meta-pill">🌆 {ville.nom_ville}</span>
                                )}
                                {agence.Telephone && (
                                    <span className="meta-pill">📞 {agence.Telephone}</span>
                                )}
                                {info?.ip_agence && (
                                    <span className="meta-pill" style={{ fontFamily: 'Space Mono,monospace', fontSize: 10 }}>
                                        🌐 {info.ip_agence}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => navigate('/locations')}>
                            ← Retour
                        </button>
                    </div>

                    {/* ── KPI mini ── */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                        {[
                            { l: 'Assets actifs',  v: stats.active_assets,     color: 'var(--accent2)' },
                            { l: 'Retournés',       v: stats.returned_assets,   color: 'var(--text3)'   },
                            { l: 'Total mouvements',v: stats.total_assignments, color: 'var(--accent)'  },
                        ].map((k, i) => (
                            <div key={i} style={{
                                background: 'var(--bg3)', borderRadius: 8,
                                padding: '10px 16px', minWidth: 100, textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.v}</div>
                                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{k.l}</div>
                            </div>
                        ))}
                        {Object.entries(stats.by_category ?? {}).map(([cat, count]) => (
                            <div key={cat} style={{
                                background: 'var(--bg3)', borderRadius: 8,
                                padding: '10px 16px', minWidth: 80, textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{count}</div>
                                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{cat}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="filter-bar" style={{ marginBottom: 14 }}>
                {tabs.map(t => (
                    <button key={t.v} className={`filter-chip ${tab === t.v ? 'active' : ''}`} onClick={() => setTab(t.v)}>
                        {t.l}
                    </button>
                ))}
            </div>

            {/* ── Assets actifs ── */}
            {tab === 'assets' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">ASSETS AFFECTÉS</div>
                        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                            {active_assets.length} asset(s)
                        </span>
                    </div>
                    <div className="desktop-table" style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr><th>Tag</th><th>Modèle</th><th>Catégorie</th><th>Marque</th><th>Statut</th><th>Affecté le</th></tr>
                            </thead>
                            <tbody>
                                {active_assets.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>Aucun asset actif</td></tr>
                                )}
                                {active_assets.map(a => (
                                    <tr key={a.assignment_id}>
                                        <td><div className="asset-id">{a.asset?.asset_tag}</div></td>
                                        <td><div className="asset-name">{a.asset?.model}</div></td>
                                        <td>{a.asset?.category?.name ?? '—'}</td>
                                        <td>{a.asset?.brand?.name ?? '—'}</td>
                                        <td>
                                            <span className="tag assigned">
                                                <span className="tag-dot" />Affecté
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                                            {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Historique ── */}
            {tab === 'historique' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">HISTORIQUE DES MOUVEMENTS</div>
                    </div>
                    <div className="desktop-table" style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr><th>Asset Tag</th><th>Modèle</th><th>Catégorie</th><th>Statut</th><th>Affecté le</th><th>Retourné le</th></tr>
                            </thead>
                            <tbody>
                                {historique.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>Aucun historique</td></tr>
                                )}
                                {historique.map(h => (
                                    <tr key={h.assignment_id}>
                                        <td><div className="asset-id">{h.asset_tag ?? '—'}</div></td>
                                        <td>{h.asset_model ?? '—'}</td>
                                        <td>{h.asset_category ?? '—'}</td>
                                        <td>
                                            <span className={`tag ${h.status === 'assigned' ? 'assigned' : 'available'}`}>
                                                <span className="tag-dot" />
                                                {h.status === 'assigned' ? 'Affecté' : 'Retourné'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                                            {h.assigned_at ? new Date(h.assigned_at).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                                            {h.returned_at ? new Date(h.returned_at).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Informations ── */}
            {tab === 'info' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">INFORMATIONS AGENCE</div></div>
                    <div style={{ padding: '16px 24px' }}>
                        <div className="form-grid">
                            {[
                                { l: 'Nom agence',         v: agence.Agence },
                                { l: 'Adresse',            v: agence.Adresse },
                                { l: 'Téléphone',          v: agence.Telephone },
                                { l: 'Tél. affiché',       v: info?.telephone_affiche },
                                { l: 'Ville',              v: ville?.nom_ville ?? info?.nom_ville },
                                { l: 'Point de vente',     v: info?.point_de_vente },
                                { l: 'Émetteur',           v: info?.emetteur },
                                { l: 'IP Agence',          v: info?.ip_agence },
                                { l: 'Type',               v: info?.type_agence },
                                { l: 'État',               v: info?.etat_agence },
                                { l: 'AnyDesk 1',          v: info?.anydesk },
                                { l: 'AnyDesk 2',          v: info?.Anydesk_2 },
                                { l: 'AnyDesk 3',          v: info?.Anydesk_3 },
                                { l: 'Coordonnées GPS',    v: agence.latitude ? `${agence.latitude}, ${agence.longitude}` : null },
                                { l: 'Autres',             v: info?.autres },
                            ].filter(r => r.v).map(r => (
                                <div key={r.l} className="form-group">
                                    <label style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>{r.l}</label>
                                    <div style={{ fontSize: 13, color: 'var(--text)', padding: '6px 0' }}>{r.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Audit ── */}
            {tab === 'audit' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">JOURNAL D'AUDIT</div></div>
                    <div className="log-list">
                        {(audit_logs ?? []).length === 0 && (
                            <div style={{ padding: '20px', color: 'var(--text3)', fontSize: 13 }}>Aucune entrée</div>
                        )}
                        {(audit_logs ?? []).map((l, i) => (
                            <div key={l.id} className="log-item">
                                <div className="log-dot-wrap">
                                    <div className="log-dot" style={{
                                        background: l.action === 'create' ? 'var(--accent2)'
                                                  : l.action === 'delete' ? 'var(--danger)'
                                                  : 'var(--accent)',
                                    }} />
                                    {i < audit_logs.length - 1 && <div className="log-line" />}
                                </div>
                                <div className="log-content">
                                    <div className="log-action">
                                        <strong>{l.action?.toUpperCase()}</strong> — {l.table_name}
                                    </div>
                                    <div className="log-meta">
                                        <span>user #{l.user_id}</span>
                                        <span>{new Date(l.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}