// src/utils/downloadFortigateConfig.js
export async function downloadFortigateConfig(agenceId, agenceName, toast) {
    const token = localStorage.getItem('token');
    try {
        console.log(`Requesting Fortigate config for agence ${agenceId} (${agenceName}) with token: ${token}`);
        const res = await fetch(
            `http://127.0.0.1:8000/api/agences/${agenceId}/fortigate-config`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? 'Erreur serveur');
        }

        const disposition = res.headers.get('Content-Disposition');
        const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1]
                      ?? `SUPRATOURS_${agenceName}_mod.conf`;

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

    }  catch (err) {
    console.error('Fortigate config error:', err);
    toast?.('error', '❌', err.message ?? 'Erreur génération config');
}
}