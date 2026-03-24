export const STATUS_MAP = {
  available:   { label: 'Disponible', color: 'var(--accent2)', bg: 'rgba(56,217,169,.12)' },
  assigned:    { label: 'Affecté',    color: 'var(--accent)',  bg: 'rgba(79,142,247,.12)' },
  maintenance: { label: 'Maintenance',color: 'var(--accent3)', bg: 'rgba(246,166,35,.12)' },
  retired:     { label: 'Retraité',   color: 'var(--danger)',  bg: 'rgba(255,92,92,.12)'  },
};
export const statusLabel = (s) => STATUS_MAP[s]?.label ?? s;