export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR') : '—';

export const timeAgo = (iso) => {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60)   return 'À l\'instant';
    if (s < 3600) return `Il y a ${Math.floor(s/60)} min`;
    if (s < 86400)return `Il y a ${Math.floor(s/3600)} h`;
    return formatDate(iso);
};