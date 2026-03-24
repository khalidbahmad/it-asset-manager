import { useMemo } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";

function Dashboard() {
  const { state: { assets, statuses, auditLogs, brands, categories, locations } } = useStore();

  // ── Résoudre status_id → nom ──────────────────────────────────────
  const statusName = (status_id) =>
    statuses?.find(s => s.id === status_id)?.name ?? '—';

  const categoryName = (category_id) =>
    categories?.find(c => c.id === category_id)?.name ?? '—';

  const brandName = (brand_id) =>
    brands?.find(b => b.id === brand_id)?.name ?? '—';

  const locationName = (location_id) =>
    locations?.find(l => l.id === location_id)?.name ?? '—';

  // ── Stats ─────────────────────────────────────────────────────────
  const s = useMemo(() => ({
    total:       assets.length,
    available:   assets.filter(a => statusName(a.status_id) === 'Disponible').length,
    assigned:    assets.filter(a => statusName(a.status_id) === 'Affecté').length,
    maintenance: assets.filter(a => statusName(a.status_id) === 'En réparation').length,
  }), [assets, statuses]);

  // ── 5 derniers logs enrichis ──────────────────────────────────────
  const recentLogs = useMemo(() =>
    [...(auditLogs ?? [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(l => ({
        ...l,
        assetTag:  l.new_data?.asset_tag ?? l.old_data?.asset_tag ?? '—',
        actionColor: { create: 'var(--accent2)', update: 'var(--accent)', delete: 'var(--danger)' }[l.action] ?? 'var(--text3)',
        timeLabel: new Date(l.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      }))
  , [auditLogs]);

  return (
    <div className="content">
      <StorePanel />

      {/* ── KPI cards ── */}
      <div className="stats-grid">
        {[
          { label: 'Total Équipements', value: s.total,       meta: 'Dans la base',        dot: 'blue',   color: 'blue'   },
          { label: 'Disponibles',       value: s.available,   meta: 'Prêts à affecter',    dot: 'green',  color: 'green'  },
          { label: 'Affectés',          value: s.assigned,    meta: 'À des employés',      dot: 'blue',   color: 'blue'   },
          { label: 'En réparation',     value: s.maintenance, meta: 'Intervention requise',dot: 'orange', color: 'orange' },
        ].map((c, i) => (
          <div key={i} className={`stat-card ${c.color}`}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-meta"><span className={`stat-dot ${c.dot}`} />{c.meta}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="charts-row">
        <div className="card">
          <div className="card-header"><div className="card-title">STATUTS</div></div>
          <DonutChart />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">CATÉGORIES</div></div>
          <BarChart />
        </div>
      </div>

      {/* ── Activité récente ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">ACTIVITÉ RÉCENTE</div>
          <div className="card-actions">
            <span style={{ fontSize: 10, color: 'var(--accent2)', fontFamily: 'Space Mono,monospace' }}>
              auditLogs[0..4]
            </span>
          </div>
        </div>
        <div className="log-list">
          {recentLogs.length === 0 && (
            <div style={{ color: 'var(--text3)', padding: '12px 0', fontSize: 12 }}>Aucune activité</div>
          )}
          {recentLogs.map((l, i) => (
            <div key={l.id} className="log-item">
              <div className="log-dot-wrap">
                <div className="log-dot" style={{ background: l.actionColor }} />
                {i < recentLogs.length - 1 && <div className="log-line" />}
              </div>
              <div className="log-content">
                <div className="log-action">
                  <strong style={{ color: l.actionColor }}>{l.action.toUpperCase()}</strong>
                  {' — '}
                  <span style={{ color: 'var(--text)' }}>{l.assetTag}</span>
                  {' sur '}
                  <span style={{ color: 'var(--text2)' }}>{l.table_name}</span>
                </div>
                <div className="log-meta">
                  <span>user #{l.user_id}</span>
                  <span>{l.timeLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Inventaire rapide ── */}
      <div className="card">
        <div className="card-header"><div className="card-title">INVENTAIRE RAPIDE</div></div>
        <div className="desktop-table" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Tag</th><th>Modèle</th><th>Catégorie</th><th>Marque</th><th>Site</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {assets.slice(0, 7).map(a => (
                <tr key={a.id}>
                  <td><div className="asset-id">{a.asset_tag}</div></td>
                  <td>{a.model}</td>
                  <td>{categoryName(a.category_id)}</td>
                  <td>{brandName(a.brand_id)}</td>
                  <td style={{ fontSize: 12 }}>{locationName(a.location_id)}</td>
                  <td>
                    <span className={`tag ${statusName(a.status_id) === 'Disponible' ? 'available' : statusName(a.status_id) === 'Affecté' ? 'assigned' : 'maintenance'}`}>
                      <span className="tag-dot" />{statusName(a.status_id)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;